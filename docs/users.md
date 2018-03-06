# Users
We don't want to create authorized REST API users manually from the commandline. That's only great for testing purposes.
Instead we want to be able to specify in the webserver where the users can be found. This is what user repositories in web servers are for.

The users for an external REST API are likely to be found in a database table. Let's see how this works for the web servers.


## Glassfish JDBC Realm to User Repository

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

Glassfish will be depricated and therefore this is not the prefered approach.



## Apache Tomcat JDBC Realm to User Repository
Currently, we can't use a Tomcat User Repository. There is currently a bug in ORDS (current version 17.4.1):

https://community.oracle.com/thread/4084028

## Weblogic JDBC Realm to User Repository
A paid licence is needed for Weblogic and therefore no part of this tutorial.

## JDBC Realm
