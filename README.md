# securing-ords
How to secure a REST API build with Oracle REST Data Services (ORDS)

## Demo API
A demo that makes the sence is securing a REST API for an E-commerce application.

We are a an online store that sells clothes to customers. We will base the API on data from a **Packaged App** in Oracle APEX: the **Sample Database Application**.

For this demo we see how the authorization works in three steps
1. Using the API via Postman with Basic Authentication
2. Using the API via Postman with Oauth2
3. Using the API via a web application with Oauth2

For the last step we build our E-commerce application using Oracle Jet application because then it makes sence to use a REST API. The Oracle JET API provides the oj.OAuth authorization plugin which supports the OAuth 2.0 open protocol.

The goal is to create a REST API for the E-commerce application to let customers:
- See products (not secured)
- Create an account (not secured)
- Place new orders
- See order history

## Creating the API
You can use this file to import the REST definition into your database.

### Securing the REST API
To make sure some of our REST endpoints require authorization, we have to add privileges to the these resources.

You can choose to set the privilege on the whole module, in this case the our whole API, or specific resources. The last one suits our needs because the product endpoint and account creating doesn't require authorization.

You don't specify what kind of authorization is used in the API. They all can be used.

## Basic authentication
The endpoint requires a user to specify there username and password. If it's not present in the request header, the user will be redirected to an ORDS login page first.

This is also named First Party Cookie Based Authentication. The name of the cookie is `__ords_sid__`.

The users must be created on the ORDS webserver.

```bash
java -jar ords.war user emp_user emp_role
Enter a password for user emp_user:
Confirm password for user emp_user:
```

curl
```bash
curl -i -k --user emp_user:Password1 https://ol7-121.localdomain:8443/ords/pdb1/testuser1/testmodule1/emp/7788
```

jQuery
```javascript
$.ajax
({
  type: "GET",
  url: "index1.php",
  dataType: 'json',
  async: false,
  username: username,
  password: password,
  data: '{ "comment" }',
  success: function (){
    alert('Thanks for your comment!'); 
  }
});
```

Oracle Jet
The Oracle JET framework provides three ways to customize the AJAX requests that Oracle JET makes when accessing REST services through the Common Model.

Pass custom AJAX options in Common Model CRUD API calls.

Supply a customURL callback function.

Replace the oj.sync or oj.ajax functions.

Basic authentication could be used for internal APIs where the user would be another application that has access to the data. 
In this situation, the users are known and don't change much over time. 

If you are exposing the API externally, then you should always go for Oauth2 because it's more secure and doens't require the manual process of creating users in ORDS.

## Oauth2 protocol

### Resource owner
The E-commerce store

### Resource server
ORDS webserver

### Client
The customers

### Authorization server
The Oracle Database

### Choosing an Authorization Grant flow
#### Authorization Code 
used with server-side Applications
#### Implicit
used with Mobile Apps or Web Applications (applications that run on the user's device)
#### Resource Owner Password Credentials
used with trusted Applications, such as those owned by the service itself
#### Client Credentials
used with Applications API access

## Creating a client

## openAPI specification

### Get the openAPI Metadata Catalog
https://oracle-base.com/articles/misc/oracle-rest-data-services-ords-open-api-swagger-support

### Get the openAPI documentation
http://editor.swagger.io/

### Generate client code

## Sample E-commerce Application
A simple boilertemplate has been used from http://megaboilerplate.com for this node.js web application.
This way, we have an application skeleton in place including authentication.

Extra things are added of course to turn it into an E-commerce application for clothes.

