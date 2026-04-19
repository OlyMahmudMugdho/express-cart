Cloudinary setup

To enable Cloudinary uploads set environment variable CLOUDINARY_URL in the form:

cloudinary://<api_key>:<api_secret>@<cloud_name>

Example (development):
CLOUDINARY_URL=cloudinary://123456789012345:abcdefgHIJKLMNOP@my-cloud

Notes:
- The project already added optional Cloudinary support in MediaService. Install the cloudinary package (done) and set CLOUDINARY_URL.
- When running locally without CLOUDINARY_URL, uploads fall back to local storage at ./uploads.
- To upload from CI/production, ensure CLOUDINARY_URL and relevant permissions are set and secrets managed securely.
