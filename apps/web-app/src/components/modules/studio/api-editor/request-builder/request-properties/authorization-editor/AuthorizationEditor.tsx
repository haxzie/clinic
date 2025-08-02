import React from "react";
import ListPropertyEditor, { Parameter } from "../shared/list-property-editor/ListPropertyEditor";
import styles from "./AuthorizationEditor.module.scss";
import { AuthorizationType, AuthorizationTypes, Authorization } from "@apiclinic/core";
import { DropDown } from "@/components/base/dropdown/DropDown";
import ChevronDownIcon from "@/components/icons/ChevronDownIcon";
import { useShallow } from "zustand/shallow";
import useApiStore from "@/store/api-store/api.store";

export default function AuthorizationEditor({ apiId }: { apiId: string }) {
  const { authorization, setAuthorization } = useApiStore(
    useShallow((state) => ({
      authorization: state.apis[apiId].authorization,
      setAuthorization: state.setAuthorization,
    }))
  );
  
  // Helper functions to create authorization objects
  const createBasicAuth = (username: string, password: string): Authorization => ({
    type: AuthorizationTypes.BASIC,
    username,
    password,
  });

  const createBearerAuth = (token: string): Authorization => ({
    type: AuthorizationTypes.BEARER,
    token,
  });

  const createApiKeyAuth = (key: string): Authorization => ({
    type: AuthorizationTypes.API_KEY,
    key,
  });

  const createOAuth2Auth = (token: string): Authorization => ({
    type: AuthorizationTypes.OAUTH2,
    token,
  });

  const createCustomAuth = (token: string): Authorization => ({
    type: AuthorizationTypes.CUSTOM,
    token,
  });

  const createNoAuth = (): Authorization => ({
    type: AuthorizationTypes.NONE,
  });

  // Handler for Basic Auth changes
  const handleBasicAuthChange = (value: Record<string, Parameter>) => {
    const username = value.username?.value || "";
    const password = value.password?.value || "";
    setAuthorization(apiId, createBasicAuth(username, password));
  };

  // Handler for Bearer Token changes
  const handleBearerAuthChange = (value: Record<string, Parameter>) => {
    const token = value.bearer_token?.value || "";
    setAuthorization(apiId, createBearerAuth(token));
  };

  // Handler for API Key changes
  const handleApiKeyAuthChange = (value: Record<string, Parameter>) => {
    const key = value.api_key?.value || "";
    setAuthorization(apiId, createApiKeyAuth(key));
  };

  // Handler for OAuth2 changes
  const handleOAuth2AuthChange = (value: Record<string, Parameter>) => {
    const token = value.access_token?.value || "";
    setAuthorization(apiId, createOAuth2Auth(token));
  };

  // Handler for Custom Auth changes
  const handleCustomAuthChange = (value: Record<string, Parameter>) => {
    // For custom auth, we'll use the first header value as the token
    const firstKey = Object.keys(value)[0];
    const token = firstKey ? value[firstKey]?.value || "" : "";
    setAuthorization(apiId, createCustomAuth(token));
  };

  // Generic helper to create parameter objects
  const createParameter = (id: string, name: string, value: string, placeholder: string) => ({
    id,
    name,
    value,
    placeholder,
  });

  // Generic helper to get authorization values for any type
  const getAuthValues = (authType: AuthorizationType, fields: Array<{id: string, name: string, placeholder: string, valueKey?: string}>) => {
    const isCorrectType = authorization?.type === authType;
    
    return fields.reduce((acc, field) => {
      let value = "";
      if (isCorrectType && authorization) {
        const valueKey = field.valueKey || (field.id === 'username' || field.id === 'password' ? field.id : 'token');
        
        // Type-safe property access
        if (valueKey === 'username' && 'username' in authorization) {
          value = authorization.username || "";
        } else if (valueKey === 'password' && 'password' in authorization) {
          value = authorization.password || "";
        } else if (valueKey === 'key' && 'key' in authorization) {
          value = authorization.key || "";
        } else if (valueKey === 'token' && 'token' in authorization) {
          value = authorization.token || "";
        }
      }
      
      acc[field.id] = createParameter(field.id, field.name, value, field.placeholder);
      return acc;
    }, {} as Record<string, Parameter>);
  };

  // Get authorization values for specific types
  const getBasicAuthValues = () => getAuthValues(AuthorizationTypes.BASIC, [
    { id: "username", name: "username", placeholder: "Enter Username", valueKey: "username" },
    { id: "password", name: "password", placeholder: "Enter Password", valueKey: "password" }
  ]);

  const getBearerAuthValues = () => getAuthValues(AuthorizationTypes.BEARER, [
    { id: "bearer_token", name: "Bearer Token", placeholder: "Enter Bearer Token" }
  ]);

  const getApiKeyAuthValues = () => getAuthValues(AuthorizationTypes.API_KEY, [
    { id: "api_key", name: "API Key", placeholder: "Enter API Key", valueKey: "key" }
  ]);

  const getOAuth2AuthValues = () => getAuthValues(AuthorizationTypes.OAUTH2, [
    { id: "access_token", name: "Access Token", placeholder: "Enter OAuth2 Access Token" }
  ]);

  const getCustomAuthValues = () => getAuthValues(AuthorizationTypes.CUSTOM, [
    { id: "custom_token", name: "Authorization", placeholder: "Enter Custom Authorization Header Value" }
  ]);

  const dropDownOptions = {
    [AuthorizationTypes.NONE]: {
      id: AuthorizationTypes.NONE,
      value: "None",
      component: <div className={styles.none}></div>,
    },
    [AuthorizationTypes.BASIC]: {
      id: AuthorizationTypes.BASIC,
      value: "Basic",
      component: (
        <ListPropertyEditor
          type="authorization"
          title="Authorization"
          onChange={handleBasicAuthChange}
          value={getBasicAuthValues()}
          hideHeader={true}
          disableNewItem={true}
          disableKeyChange={true}
          disableRemoveItem={true}
        />
      ),
    },
    [AuthorizationTypes.BEARER]: {
      id: AuthorizationTypes.BEARER,
      value: "Bearer Token",
      component: (
        <ListPropertyEditor
          type="authorization"
          title="Authorization"
          onChange={handleBearerAuthChange}
          value={getBearerAuthValues()}
          hideHeader={true}
          disableNewItem={true}
          disableKeyChange={true}
          disableRemoveItem={true}
        />
      ),
    },
    [AuthorizationTypes.API_KEY]: {
      id: AuthorizationTypes.API_KEY,
      value: "API Key",
      component: (
        <ListPropertyEditor
          type="authorization"
          title="Authorization"
          onChange={handleApiKeyAuthChange}
          value={getApiKeyAuthValues()}
          hideHeader={true}
          disableNewItem={true}
          disableKeyChange={true}
          disableRemoveItem={true}
        />
      ),
    },
    [AuthorizationTypes.OAUTH2]: {
      id: AuthorizationTypes.OAUTH2,
      value: "OAuth2",
      component: (
        <ListPropertyEditor
          type="authorization"
          title="Authorization"
          onChange={handleOAuth2AuthChange}
          value={getOAuth2AuthValues()}
          hideHeader={true}
          disableNewItem={true}
          disableKeyChange={true}
          disableRemoveItem={true}
        />
      ),
    },
    [AuthorizationTypes.CUSTOM]: {
      id: AuthorizationTypes.CUSTOM,
      value: "Custom",
      component: (
        <ListPropertyEditor
          type="headers"
          title="Auth Header"
          onChange={handleCustomAuthChange}
          value={getCustomAuthValues()}
          hideHeader={true}
          disableNewItem={true}
          disableKeyChange={true}
          disableRemoveItem={true}
        />
      ),
    },
  };

  // Get current selected option based on authorization from store
  const currentAuthType = authorization?.type || AuthorizationTypes.NONE;
  const selectedOption = dropDownOptions[currentAuthType];

  const handleAuthorizationTypeChange = ({ id }: { id: string }) => {
    const newAuthType = id as AuthorizationType;
    
    // Update the store with the new authorization type
    switch (newAuthType) {
      case AuthorizationTypes.NONE:
        setAuthorization(apiId, createNoAuth());
        break;
      case AuthorizationTypes.BASIC:
        setAuthorization(apiId, createBasicAuth("", ""));
        break;
      case AuthorizationTypes.BEARER:
        setAuthorization(apiId, createBearerAuth(""));
        break;
      case AuthorizationTypes.API_KEY:
        setAuthorization(apiId, createApiKeyAuth(""));
        break;
      case AuthorizationTypes.OAUTH2:
        setAuthorization(apiId, createOAuth2Auth(""));
        break;
      case AuthorizationTypes.CUSTOM:
        setAuthorization(apiId, createCustomAuth(""));
        break;
      default:
        setAuthorization(apiId, createNoAuth());
    }
  };

  const DropDownSelectElement = () => {
    return (
      <div className={styles.picker}>
        {selectedOption.value}
        <ChevronDownIcon size={18} />
      </div>
    );
  };

  return (
    <div className={styles.authorizationEditor}>
      <div className={styles.header}>
        <div className={styles.contentTypePicker}>
          Authorization Type:
          <DropDown
            value={selectedOption}
            options={dropDownOptions}
            onChange={handleAuthorizationTypeChange}
            selectElement={DropDownSelectElement}
            showChevron={false}
          />
        </div>
      </div>
      <div className={styles.content}>{selectedOption.component}</div>
    </div>
  );
}
