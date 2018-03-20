begin

  OAUTH.DELETE_CLIENT('Fashion Store (Application)');
  OAUTH.DELETE_CLIENT('Fashion Store (customer client_credentials)');
  OAUTH.DELETE_CLIENT('Fashion Store (Customer implicit)');
  OAUTH.DELETE_CLIENT('Fashion Store (Customer authorization_code)');

  begin
  
    oauth.create_client(
      p_name => 'Fashion Store (Application)',
      p_grant_type => 'client_credentials',
      p_support_email => 'support@oracle.com',
      p_privilege_names => ''
      );
    commit;
  end;

  begin 
  oauth.grant_client_role(
      'Fashion Store (Application)',
      'demo.api.application');
  commit;
  end;

  begin
    
    oauth.create_client(
      p_name => 'Fashion Store (Customer client_credentials)',
      p_grant_type => 'client_credentials',
      p_support_email => 'support@oracle.com',
      p_privilege_names => ''
      );

    commit;
  end;

  begin 
  oauth.grant_client_role(
      'Fashion Store (Customer client_credentials)',
      'demo.api.customer');
  commit;
  end;

  begin
  
    oauth.create_client(
      p_name => 'Fashion Store (Customer implicit)',
      p_grant_type => 'implicit',
      p_description => 'For accessing customer resources implicit',
      p_redirect_uri => 'http://localhost:3000/callback',
      p_support_email => 'support@oracle.com',
      p_support_uri => 'http://localhost:3000',
      p_privilege_names => 'demo.api.account'-- Currently not possible to add multiple privileges
      );
    commit;
  end;

  begin 
  oauth.grant_client_role(
      'Fashion Store (Customer implicit)',
      'demo.api.customer');
  commit;
  end;

  begin
  
    oauth.create_client(
      p_name => 'Fashion Store (Customer authorization_code)',
      p_grant_type => 'authorization_code',
      p_description => 'For accessing customer resources with an authorization code',
      p_redirect_uri => 'http://localhost:3000/callback',
      p_support_email => 'support@oracle.com',
      p_support_uri => 'http://localhost:3000',
      p_privilege_names => 'demo.api.account'-- Currently not possible to add multiple privileges
      );
    commit;
  end;

  begin 
  oauth.grant_client_role(
      'Fashion Store (Customer authorization_code)',
      'demo.api.customer');
  commit;
  end;
end;
/