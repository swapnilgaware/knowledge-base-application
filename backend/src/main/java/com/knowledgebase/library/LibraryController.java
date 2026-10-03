package com.knowledgebase.library;
import com.knowledgebase.user.UserProfileService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/books")
public class LibraryController {
    private final BookRepository books;
    private final ChapterRepository chapters;
    private final ReadingRepository reading;
    private final UserProfileService users;
    public LibraryController(BookRepository books,ChapterRepository chapters,ReadingRepository reading,UserProfileService users){
        this.books=books;this.chapters=chapters;this.reading=reading;this.users=users;
    }
    @GetMapping
    public List<Book.BookView> list(@AuthenticationPrincipal OidcUser identity){
        var state=reading.findByIdUserId(users.profile(identity).id()).stream()
                .collect(Collectors.toMap(ReadingProgress::bookId,p->p));
        return books.findAllByOrderByTitleAsc().stream().map(book->{
            var progress=state.get(book.id());
            return book.view(progress==null?0:progress.chapterNumber(),progress!=null&&progress.completed());
        }).toList();
    }
    @GetMapping("/{id}/contents")
    public List<ChapterRepository.ChapterHeading> contents(@PathVariable String id){
        book(id);return chapters.findByBookIdOrderByChapterNumberAsc(id);
    }
    @GetMapping("/{id}/chapters/{number}")
    public BookChapter.ChapterView chapter(@PathVariable String id,@PathVariable int number){
        return chapters.findByBookIdAndChapterNumber(id,number).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND)).view();
    }
    @PutMapping("/{id}/progress") @Transactional
    public void progress(@AuthenticationPrincipal OidcUser identity,@PathVariable String id,@RequestBody ProgressInput input){
        var book=book(id);
        if(input.chapterNumber()<0||input.chapterNumber()>=book.chapterCount()||(input.completed()&&input.chapterNumber()!=book.chapterCount()-1))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Invalid reading position");
        reading.save(new ReadingProgress(users.profile(identity).id(),id,input.chapterNumber(),input.completed()));
    }
    private Book book(String id){return books.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND));}
    public record ProgressInput(int chapterNumber,boolean completed){}
}
