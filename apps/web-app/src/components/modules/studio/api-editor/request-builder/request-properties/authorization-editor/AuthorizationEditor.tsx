import React, { useState } from "react";
import ListPropertyEditor from "../shared/list-property-editor/ListPropertyEditor";
import styles from "./AuthorizationEditor.module.scss";
import { AuthorizationType, AuthorizationTypes } from "@apiclinic/core";
import { DropDown } from "@/components/base/dropdown/DropDown";
import ChevronDownIcon from "@/components/icons/ChevronDownIcon";

export default function AuthorizationEditor({ apiId }: { apiId: string }) {
  console.log("apiId", apiId);
  const dropDownOptions = {
    [AuthorizationTypes.NONE]: {
      id: AuthorizationTypes.NONE,
      value: "none",
      component: <div className={styles.none}></div>,
    },
    [AuthorizationTypes.BASIC]: {
      id: AuthorizationTypes.BASIC,
      value: "Basic",
      component: (
        <ListPropertyEditor
          type="authorization"
          title="Authorization"
          onChange={() => {}}
          value={{
            username: {
              id: "username",
              name: "username",
              value: "",
              placeholder: "Enter Username",
            },
            password: {
              id: "password",
              name: "password",
              value: "",
              placeholder: "Enter Password",
            },
          }}
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
          onChange={() => {}}
          value={{
            bearer_token: {
              id: "bearer_token",
              name: "Bearer Token",
              value: "",
              placeholder: "Enter Bearer Token",
            },
          }}
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
          onChange={() => {}}
          value={{
            api_key: {
              id: "api_key",
              name: "API Key",
              value: "",
              placeholder: "Enter API Key",
            },
          }}
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
          onChange={() => {}}
          value={{
            access_token: {
              id: "access_token",
              name: "Access Token",
              value: "",
              placeholder: "Enter OAuth2 Access Token",
            },
            refresh_token: {
              id: "refresh_token",
              name: "Refresh Token",
              value: "",
              placeholder: "Enter OAuth2 Token Type",
            },
            authorization_url: {
              id: "authorization_url",
              name: "Authorization URL",
              value: "",
              placeholder: "Enter OAuth2 Authorization URL",
            },
            client_id: {
              id: "client_id",
              name: "Client ID",
              value: "",
              placeholder: "Enter OAuth2 Client ID",
            },
            client_secret: {
              id: "client_secret",
              name: "Client Secret",
              value: "",
              placeholder: "Enter OAuth2 Client Secret",
            },
            redirect_uri: {
              id: "redirect_uri",
              name: "Redirect URI",
              value: "",
              placeholder: "Enter OAuth2 Redirect URI",
            },
            token_type: {
              id: "token_type",
              name: "Token Type",
              value: "",
              placeholder: "Enter OAuth2 Token Type",
            },
            scopes: {
              id: "scopes",
              name: "Scopes",
              value: "",
              placeholder: "Enter OAuth2 Scopes (comma separated)",
            },
          }}
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
          onChange={() => {}}
          value={{}}
        />
      ),
    },
  };

  const [selectedOption, setSelectedOption] = useState<
    (typeof dropDownOptions)[AuthorizationType]
  >(dropDownOptions[AuthorizationTypes.NONE]);

  const handleAuthorizationTypeChange = ({ id }: { id: string }) => {
    setSelectedOption(dropDownOptions[id as AuthorizationType]);
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
      {selectedOption.component}
    </div>
  );
}
