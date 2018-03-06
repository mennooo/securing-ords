# Users
We don't want to create authorized REST API users manually from the commandline. That's only great for testing purposes.
Instead we want to be able to specify in the webserver where the users can be found. This is what user repositories in web servers are for.

The users for an external REST API are likely to be found in a database table. Let's see how this works for the web servers.

## Authenticating users against a User Repository via JDBC

We can run ORDS in multiple ways:
- Standalone (free, uses Jetty)
- Glassfish (free, deprecated)
- Apache Tomcat (free)
- Oracle Weblogic (paid licence)

But working with user repositories is a problem for Standalone and Apache Tomcat at the moment. We'll learn why later.

### User Repository table structure

The users table must contain at least two columns:
- Username
- Password (Make sure the value is encrypted)

There must be a table that contains one row for every valid role that is assigned to a particular user. It is legal for a user to have zero, one, or more than one valid role. The user roles table must contain at least two columns:
- Username
- Role name

```sql
create table user_groups (
  groupid   varchar2(20) not null,
  userid    varchar2(255) not null
);

alter table user_groups add constraint user_groups_pk primary key ( groupid );

create table users (
  userid     varchar2(255) not null,
  password   varchar2(255) not null
);

alter table users add constraint users_pk primary key ( userid );

alter table user_groups
  add constraint user_groups_users_fk foreign key ( userid )
    references users ( userid );
```

Now add a user (scott/tiger)

```sql
insert into users(userid, password) 
values ('scott', dbms_crypto.hash(utl_raw.cast_to_raw('tiger'), 4));

insert into user_groups(groupid, userid) 
values ('twinq.test.api', 'scott');

commit;
```

### ORDS Standalone
Seems not possible:

https://community.oracle.com/thread/4117960

## Glassfish JDBC Realm to User Repository
Glassfish will be **deprecated** and therefore not the prefered approach. But since it still works, here's the config..

### JDBC Connection Pool
Pool Name: OraclePool  
Resource Type: javax.sql.DataSource  
Database Driver Vendor: Oracle  

**Additional Properties**  
url: jdbc:oracle:thin:@localhost:1521:ORCL  
username: demo  
password: demo  

Make sure to copy for example `ojdbc8.jar` to `<your-domain>\lib`. For example:

`glassfish4\glassfish\domains\domain1\lib\ojdbc8.jar`

Restart the domain.

Then click the ping button in this new Connection Pool.

### JDBC Resources
JNDI Name: jdbc/orcl
Pool Name: 'OraclePool'

### JDBC Realm
JAAS Context: jdbcRealm  
JNDI: jdbc/orcl  
User Table: glassfish_users  
User Name Column: userid  
Password Column: password  
Group Table: glassfish_user_groups  
Group Table User Name Column: userid  
Group Name Column: groupid  
Password Encryption Algorithm: AES  

Restart the domain.

Now you should be able to use users from the table to authenticate for REST API usage.

## Apache Tomcat JDBC Realm to User Repository
Currently, we can't use a Tomcat User Repository. There is currently a bug in ORDS (current version 17.4.1):

https://community.oracle.com/thread/4084028

But I try to define it anyway.

### JNDI DataSource
IN `server.xml` add the new resource under `GlobalNamingResources`.

```xml
    <Resource name="jdbc/orcl" auth="Container" type="javax.sql.DataSource"
               maxTotal="100" maxIdle="30" maxWaitMillis="10000"
               username="twqb7" password="twqb7" driverClassName="oracle.jdbc.driver.OracleDriver"
               url="jdbc:oracle:thin:@localhost:1521:ORCL"/>
```


Make sure to copy for example `ojdbc8.jar` to `$CATALINA_BASE\lib`. For example:

`C:\Program Files\Apache Software Foundation\Tomcat 9.0\lib\ojdbc8.jar`

### DataSourceRealm
DataSourceRealm is an implementation of the Tomcat Realm interface that looks up users in a relational database accessed via a JNDI named JDBC DataSource.

Add the following under `<Engine name="Catalina" defaultHost="localhost">` in `server.xml`.

```xml
<Realm className="org.apache.catalina.realm.DataSourceRealm"
       dataSourceName="jdbc/otwq"
       userTable="USERS"
       userNameCol="USERNAME"
       userCredCol="PASSWORD"
       userRoleTable="ROLES"
       roleNameCol="ROLE">
        <CredentialHandler className="org.apache.catalina.realm.MessageDigestCredentialHandler" 
          algorithm="SHA-256" iterations="1" saltLength="0" encoding="UTF-8" />
      </Realm>
```

Restart Tomcat and try to login.

## Weblogic JDBC Realm to User Repository
A paid licence is needed for Weblogic and therefore no part of this tutorial.
