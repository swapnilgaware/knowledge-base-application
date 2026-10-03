package com.knowledgebase.security;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;

@RestControllerAdvice
public class ApiErrors{
    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<Problem> status(ResponseStatusException exception){
        return ResponseEntity.status(exception.getStatusCode()).body(new Problem(exception.getReason()==null?"Request could not be completed.":exception.getReason()));
    }
    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    ResponseEntity<Problem> conflict(){
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new Problem("This mindmap changed. Reload it before saving."));
    }
    public record Problem(String message){}
}
