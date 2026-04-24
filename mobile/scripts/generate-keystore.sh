#!/bin/bash

# Configuration
KEYSTORE_NAME="release.keystore"
KEY_ALIAS="my-key-alias"
VALIDITY_DAYS=10000

echo "--- Android Keystore Generator ---"
read -p "Enter Keystore Password: " PASSWORD
read -p "Enter Key Password (often same as keystore): " KEY_PASSWORD

# Generate Keystore
keytool -genkey -v -keystore $KEYSTORE_NAME -alias $KEY_ALIAS -keyalg RSA -keysize 2048 -validity $VALIDITY_DAYS -storepass $PASSWORD -keypass $KEY_PASSWORD -dname "CN=ExpressCart, OU=Mobile, O=ExpressCart, L=TechCity, S=State, C=US"

if [ $? -eq 0 ]; then
    echo "------------------------------------------------"
    echo "SUCCESS: $KEYSTORE_NAME generated."
    echo "------------------------------------------------"
    echo "Copy the following BASE64 string to your GitHub Secret: ANDROID_KEYSTORE_BASE64"
    echo ""
    base64 < $KEYSTORE_NAME
    echo ""
    echo "------------------------------------------------"
    echo "Other secrets to add to GitHub:"
    echo "KEY_ALIAS: $KEY_ALIAS"
    echo "KEYSTORE_PASSWORD: $PASSWORD"
    echo "KEY_PASSWORD: $KEY_PASSWORD"
    echo "------------------------------------------------"
    echo "KEEP THIS FILE SAFE AND NEVER COMMIT IT!"
else
    echo "Failed to generate keystore."
fi
