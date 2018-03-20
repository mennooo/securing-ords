select u.cust_email
     , r.role_name
     , u.cust_password
  from vw_users u
  join vw_roles r
    on r.cust_email = u.cust_email;
