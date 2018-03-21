select name
     , auth_flow 
     , client_id
     , client_secret
  from user_ords_clients;

select * from user_ords_client_roles;  
select * from user_ords_client_privileges;

select approval_id 
  from user_ords_approvals
 where title = 'Fashion Store (Customer authorization_code)';
 
begin
  oauth.modify_approval_status(
    p_status      => 'PENDING',
    p_updated_by  => 'DEMO',

    p_approval_user => 'mennooo@hotmail.com',
    p_approval_id => 12712
  );
  commit;
end;
/