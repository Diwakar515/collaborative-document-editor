package com.docs.dto;

public class CollaboratorResponseDTO {

    private String collaboratorName;
    private String collaboratorEmail;
    private String permissionType;

    public String getCollaboratorName() {
        return collaboratorName;
    }

    public void setCollaboratorName(
            String collaboratorName
    ) {
        this.collaboratorName =
                collaboratorName;
    }

    public String getCollaboratorEmail() {

        return collaboratorEmail;
    }

    public void setCollaboratorEmail(
            String collaboratorEmail
    ) {

        this.collaboratorEmail =
                collaboratorEmail;
    }

    public String getPermissionType() {

        return permissionType;
    }

    public void setPermissionType(
            String permissionType
    ) {

        this.permissionType =
                permissionType;
    }
}