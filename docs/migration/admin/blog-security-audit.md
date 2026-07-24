# Blog Management - Security Audit

## Assessment
- **Authentication**: Strict boundary enforced via Server Component Layout requiring valid JWT `access_token` cookies before mounting.
- **XSS & Rich Text**: The Blog Form retains `RichTextEditor`. Any rendering of this content on the B2C side must ensure `dangerouslySetInnerHTML` is passed through DOMPurify or a similar sanitizer.
- **Upload Validation**: Handled by Express backend (Multer). Only valid file structures are sent.
- **CSRF**: As mutations run through Axios against an external Express backend, standard origin policies apply.
