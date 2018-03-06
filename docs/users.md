# Users
We don't want to create authorized REST API users manually from the commandline. That's only great for testing purposes.
Instead we want to be able to specify in the webserver where the users can be found. This is what user repositories in web servers are for.

The users for an external REST API are likely to be found in a database table. Let's see how this works for the web servers.


## Glassfish JDBC Realm to User Repository
Glassfish will be deprecated and therefore this is not the prefered approach. But since it still works, here the config..

### Table structure
```sql
create table glassfish_user_groups (
  groupid   varchar2(20) not null,
  userid    varchar2(255) not null
);

alter table glassfish_user_groups add constraint user_groups_pk primary key ( groupid );

create table glassfish_users (
  userid     varchar2(255) not null,
  password   varchar2(255) not null
);

alter table glassfish_users add constraint users_pk primary key ( userid );

alter table glassfish_user_groups
  add constraint user_groups_users_fk foreign key ( userid )
    references glassfish_users ( userid );
```

Now add a user

```sql
insert into glassfish_users(userid, password) 
values ('menno', dbms_crypto.hash(utl_raw.cast_to_raw('menno'), 4));

insert into glassfish_user_groups(groupid, userid) 
values ('twinq.test.api', 'menno');

commit;
```

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

Now you should be able to use user from the table to authenticate for REST API usage.

## Apache Tomcat JDBC Realm to User Repository
Currently, we can't use a Tomcat User Repository. There is currently a bug in ORDS (current version 17.4.1):

https://community.oracle.com/thread/4084028

But I try to define it anyway

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

Restart the Tomcat.

### DataSourceRealm
DataSourceRealm is an implementation of the Tomcat Realm interface that looks up users in a relational database accessed via a JNDI named JDBC DataSource.

Add the following under `<Engine name="Catalina" defaultHost="localhost">` in `server.xml`.

```xml
<Realm className="org.apache.catalina.realm.DataSourceRealm"
       dataSourceName="jdbc/orcl"
       userTable="USERS"
       userNameCol="USERNAME"
       userCredCol="PASSWORD"
       userRoleTable="ROLES"
       roleNameCol="ROLE"
       digest="SHA-256"/>
```
## Weblogic JDBC Realm to User Repository
A paid licence is needed for Weblogic and therefore no part of this tutorial.

## JDBC Realm
