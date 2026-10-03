package com.knowledgebase.library;
import com.knowledgebase.user.UserProfileService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@RestController @RequestMapping("/api/saved-posts")
public class SavedPostController{
    private final SavedPostRepository posts;
    private final UserProfileService users;
    private static final Set<String> STARTER_IDS=Set.of("graph-rag","active-recall","agent-workflows","systems","reading-notes","java-jpa");
    public SavedPostController(SavedPostRepository posts,UserProfileService users){this.posts=posts;this.users=users;}
    @GetMapping public List<String> list(@AuthenticationPrincipal OidcUser identity){
        return posts.findByUserIdOrderByCreatedAtDesc(users.profile(identity).id()).stream().map(SavedPost::postId).toList();
    }
    @PutMapping("/{post}") @Transactional
    public void save(@AuthenticationPrincipal OidcUser identity,@PathVariable String post){
        if(!STARTER_IDS.contains(post))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Unknown article");
        var user=users.profile(identity).id();
        if(!posts.existsByUserIdAndPostId(user,post))posts.save(new SavedPost(user,post));
    }
    @DeleteMapping("/{post}") @Transactional
    public void remove(@AuthenticationPrincipal OidcUser identity,@PathVariable String post){posts.deleteByUserIdAndPostId(users.profile(identity).id(),post);}
}
