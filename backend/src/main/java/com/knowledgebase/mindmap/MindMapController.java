package com.knowledgebase.mindmap;
import com.knowledgebase.user.UserProfileService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.util.*;

@RestController @RequestMapping("/api/mindmaps")
public class MindMapController {
    private final MindMapRepository maps;private final UserProfileService users;private final ObjectMapper json;
    public MindMapController(MindMapRepository maps,UserProfileService users,ObjectMapper json){this.maps=maps;this.users=users;this.json=json;}
    @GetMapping public List<MapView> list(@AuthenticationPrincipal OidcUser identity){
        return maps.findByUserIdOrderByUpdatedAtDesc(users.profile(identity).id()).stream().map(this::view).toList();
    }
    @GetMapping("/{id}") public MapView get(@AuthenticationPrincipal OidcUser identity,@PathVariable UUID id){return view(owned(identity,id));}
    @PostMapping @ResponseStatus(HttpStatus.CREATED) @Transactional
    public MapView create(@AuthenticationPrincipal OidcUser identity,@RequestBody MapInput input){
        validate(input);return view(maps.saveAndFlush(new MindMap(users.profile(identity).id(),input.title().strip(),json.writeValueAsString(input.nodes()))));
    }
    @PutMapping("/{id}") @Transactional
    public MapView update(@AuthenticationPrincipal OidcUser identity,@PathVariable UUID id,@RequestBody MapInput input){
        validate(input);var map=owned(identity,id);
        if(map.version()!=input.version())throw new ResponseStatusException(HttpStatus.CONFLICT,"This mindmap changed. Reload it before saving.");
        map.update(input.title().strip(),json.writeValueAsString(input.nodes()));
        return view(maps.saveAndFlush(map));
    }
    private MindMap owned(OidcUser identity,UUID id){
        return maps.findByIdAndUserId(id,users.profile(identity).id()).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND));
    }
    private MapView view(MindMap map){return new MapView(map.id(),map.title(),json.readValue(map.nodes(),Node[].class),map.version(),map.updatedAt());}
    private void validate(MapInput input){
        if(input.title()==null||input.title().isBlank()||input.title().length()>120||input.nodes()==null||input.nodes().isEmpty()||input.nodes().size()>60)bad();
        var nodes=new HashMap<String,Node>();int roots=0;
        for(var node:input.nodes()){
            if(node==null||node.id()==null||node.id().isBlank()||node.id().length()>80||node.label()==null||node.label().isBlank()||node.label().length()>120||nodes.put(node.id(),node)!=null)bad();
            if(node.parentId()==null)roots++;
        }
        if(roots!=1)bad();
        for(var node:input.nodes()){
            var visited=new HashSet<String>();var current=node;
            while(current!=null){
                if(!visited.add(current.id()))bad();
                String parent=current.parentId();
                if(parent!=null&&!nodes.containsKey(parent))bad();
                current=parent==null?null:nodes.get(parent);
            }
        }
    }
    private void bad(){throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Use one root, connected branches, and labels of 1–120 characters (up to 60 ideas).");}
    public record Node(String id,String parentId,String label){}
    public record MapInput(String title,List<Node> nodes,long version){}
    public record MapView(UUID id,String title,Node[] nodes,long version,Instant updatedAt){}
}
