This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

install mongodb

```bash
cp example.env.local .env.local

npm install
npm run dev
# or
yarn dev
# or
pnpm dev
```

configure .env.local

---

# Setting Up TLS Encryption and Authentication for MongoDB

This guide provides step-by-step instructions for setting up TLS encryption and authentication for your MongoDB deployment using OpenSSL.

NOTE: Give localhost to `CN` or in `SAN` for mongodb to connect while developing

## Certificate and Key Generation

1. Generate the CA Key and Certificate:

   ```bash
   openssl genpkey -algorithm RSA -out ca.key
   openssl req -new -x509 -key ca.key -out ca.crt
   ```

2. Generate the Server Key and Certificate Signing Request (CSR):

   ```bash
   openssl genpkey -algorithm RSA -out server.key
   openssl req -new -key server.key -out server.csr
   ```

3. Sign the Server CSR with the CA to obtain the Server Certificate:

   ```bash
   openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out server.crt
   ```

4. Generate the Client Key and Certificate Signing Request (CSR):

   ```bash
   openssl genpkey -algorithm RSA -out client1.key
   openssl req -new -key client1.key -out client1.csr
   ```

5. Sign the Client CSR with the CA to obtain the Client Certificate:

   ```bash
   openssl x509 -req -in client1.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out client1.crt
   ```

6. Create the MongoDB PEM files:
   ```bash
   cat server.crt server.key > mongod.pem
   cat client1.crt client1.key > client1_cert.pem
   ```

## MongoDB Server Configuration

1. Open the `/etc/mongod.conf` file.

2. Add the following configuration under the `net` section to enable TLS encryption and authentication:

   ```yaml
   net:
     tls:
       mode: requireTLS
       certificateKeyFile: /path/to/mongod.pem
       certificateKeyFilePassword: <optional_password>
       CAFile: /path/to/ca.crt
   ```

   Replace `/path/to/mongod.pem` with the actual path to the `mongod.pem` file, and `/path/to/ca.crt` with the actual path to the `ca.crt` file. Optionally, provide the password for the `certificateKeyFile` if applicable.

## MongoDB Client Connection

To connect to the MongoDB server using TLS, use the following command:

```bash
mongosh --tls --tlsCAFile /path/to/ca.crt --tlsCertificateKeyFile /path/to/client1_cert.pem
```

Replace `/path/to/ca.crt` with the actual path to the `ca.crt` file, and `/path/to/client1_cert.pem` with the actual path to the `client1_cert.pem` file.

---

NOTE: 
https://github.com/vercel/next.js/issues/55663