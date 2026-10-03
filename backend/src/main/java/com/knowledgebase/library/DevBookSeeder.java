package com.knowledgebase.library;
import org.springframework.boot.*;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.regex.Pattern;

@Component
@Profile("dev")
public class DevBookSeeder implements ApplicationRunner {
    private final BookRepository books;
    private final ChapterRepository chapters;
    public DevBookSeeder(BookRepository books,ChapterRepository chapters){this.books=books;this.chapters=chapters;}
    @Override @Transactional
    public void run(ApplicationArguments args) throws Exception {
        seed("alice","Alice's Adventures in Wonderland","Lewis Carroll","Fantasy","Follow a curious mind into a world where every assumption is worth questioning.","mint","11",false);
        seed("looking-glass","Through the Looking-Glass","Lewis Carroll","Fantasy","A mirror, a chessboard, and an adventure in seeing things from another perspective.","lavender","12",false);
        seed("sherlock","The Adventures of Sherlock Holmes","Arthur Conan Doyle","Mystery","Twelve mysteries about observation, evidence, and the art of asking better questions.","amber","1661",true);
    }
    private void seed(String id,String title,String author,String category,String description,String color,String source,boolean stories) throws Exception {
        if(books.existsById(id)) return;
        String text=new ClassPathResource("books/"+id+".txt").getContentAsString(StandardCharsets.UTF_8).replace("\r\n","\n");
        int end=text.indexOf("*** END OF THE PROJECT GUTENBERG EBOOK");
        String body=text.substring(0,end);
        var pattern=Pattern.compile(stories?"(?m)^[IVX]+\\. [A-Z][^\\n]+$":"(?m)^CHAPTER [IVX]+\\.\\n[^\\n]+");
        var matcher=pattern.matcher(body);
        record Section(int start,int end,String title){}
        var sections=new ArrayList<Section>();
        while(matcher.find()) sections.add(new Section(matcher.start(),matcher.end(),matcher.group().replace("\n"," ")));
        if(sections.size()!=12) throw new IllegalStateException("Expected 12 sections for "+id);
        books.save(new Book(id,title,author,category,description,color,"https://www.gutenberg.org/ebooks/"+source,sections.size()));
        for(int i=0;i<sections.size();i++){
            var section=sections.get(i);
            int stop=i+1<sections.size()?sections.get(i+1).start():body.length();
            String content=body.substring(section.end(),stop).strip();
            // Retain the edition's front matter and Gutenberg license in a separate reader section.
            chapters.save(new BookChapter(id,i,section.title(),content));
        }
        chapters.save(new BookChapter(id,12,"Edition credits and license",text.substring(0,sections.getFirst().start()).strip()+"\n\n"+text.substring(end).strip()));
    }
}
