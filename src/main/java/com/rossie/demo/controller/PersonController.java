package com.rossie.demo.controller;

import com.rossie.demo.model.Person;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
public class PersonController {

    List<Person> persons = new ArrayList<>();
    {
        persons.add(new Person("John", "Doe", 30, "JohnDoe@gmail.com"));
        persons.add(new Person("Jane", "Doe", 18, "JaneDoe@gmail.com"));
    }

    @GetMapping("/persons")
    public List<Person> getPersons() {
        return this.persons;
    }

    @PostMapping("/add-person")
    public Person addPerson(@RequestBody Person person) {
        this.persons.add(person);
        return person;
    }

}
