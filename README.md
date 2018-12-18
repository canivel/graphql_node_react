# graphql_node_react

Repo for the course - Academind graphql, node with react

### mutation example

```javascript
mutation {
    createEvent(eventIput: {title: "A Test", description: "A description", price: 9.99, date: "2018-12-18T16:08:29.342Z"}) {
        title
    }
}

mutation {
  createUser(userInput: {name: "Test User", email: "test@ttest.com", password: "asdasdasd"}) {
    email
    password
  }
}
```

### query example

```javascript
query {
    events {
        title
        _id
    }
}
```
