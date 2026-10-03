# Knowledge Base login theme

`login/template.ftl` is adapted from the Keycloak 26.8.0 base login layout, distributed under the Apache License 2.0 included in `UPSTREAM-LICENSE.txt`. The original Keycloak project is available at https://github.com/keycloak/keycloak. Changes add Knowledge Base branding, a story panel, app navigation, and surrounding copy. The built-in login form, errors, password toggle, and authentication-session checks remain inherited from Keycloak.

The theme is mounted into the local Keycloak container. After Keycloak upgrades, compare this layout with the new upstream base template before updating the image version. All application login content and styling is served locally; no external fonts or images are loaded by the theme.
