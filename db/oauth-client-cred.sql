declare

  l_env varchar2(4000);
  l_env_template varchar2(2000) := 
    q'[#PREFIX#_#FLOW#_OAUTH_CLIENT_ID='#CLIENT_ID#'#LINEBREAK##PREFIX#_#FLOW#_OAUTH_CLIENT_SECRET='#CLIENT_SECRET#']';

  cursor c_clients is
    select name
         , auth_flow 
         , client_id
         , client_secret
         , case when name like '%Application%' then 'APP' else 'USER' end prefix
      from user_ords_clients;

begin

  for rec in c_clients loop

    l_env := l_env_template;

    l_env := replace(l_env, '#CLIENT_ID#', rec.client_id);
    l_env := replace(l_env, '#CLIENT_SECRET#', rec.client_secret);
    l_env := replace(l_env, '#LINEBREAK#', chr(10));
    l_env := replace(l_env, '#PREFIX#', rec.prefix);
    l_env := replace(l_env, '#FLOW#', rec.auth_flow);

    dbms_output.put_line(l_env);
    dbms_output.put_line('');

  end loop;

end;
/
