import mongoose from "mongoose";

export async function storeData(data: any, collectionName: string) {
  const collection = mongoose.connection.db.collection(collectionName);

  try {
    const result = await collection.insertOne({ data });
    console.log(`Data with key '${collectionName}' stored securely.`);
    return result; // Return the result of the insert operation
  } catch (error) {
    console.error(`Error storing data with key '${collectionName}':`, error);
    // throw error; // Rethrow the error so it can be handled by the caller
    return null;
  }
}

export async function getData(key: any, collectionName: string) {
  const collection = mongoose.connection.db.collection(collectionName);

  try {
    const result = await collection.findOne({ key });
    if (result) {
      console.log(`Data with key '${key}' retrieved securely.`);
      return result.data;
    }
    console.log(`Data with key '${key}' not found.`);
    return null;
  } catch (error) {
    console.error(`Error retrieving data with key '${key}':`, error);
    return null;
  }
}

// update collection in table for a key
export async function updateData(userID: any, data: any, collectionName: string, key: string) {
  const collection = mongoose.connection.db.collection(collectionName);

  try {
    const result = await collection.updateOne({ userID }, { $set: { [key]: data } });

    console.log(`Data with key '${userID}' updated securely.`);
    return result; // Return the result of the insert operation
  } catch (error) {
    console.error(`Error updating data with key '${userID}':`, error);
    // throw error; // Rethrow the error so it can be handled by the caller
    return null;
  }
}

// check if user_sso_id ID exists
/**
 *  "aadhaar" : {
        "aadhaar" : "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n<Certificate><CertificateData><KycRes code=\"ff2d3906fc834c5a9cd151268bba14ba\" ret=\"Y\" ts=\"2023-09-15T04:48:30.161+05:30\" ttl=\"2024-09-14T04:48:30\" txn=\"UKC:16f2f92c0609d286aa3eff4d8c7bbd2720230915044813\"><UidData tkn=\"01002274Ob5U2vO49p2wTDRD81lVAut3nBcJpANWSSciIFm2JwE6Gpvlhf72wQg77E/JovRd\" uid=\"xxxxxxxx8328\"><Poi dob=\"09-07-1994\" gender=\"M\" name=\"Pavan Ranganath\"/><Poa co=\"S/O: K V Ranganath\" country=\"India\" dist=\"Bangalore\" house=\"#300\" lm=\"Near Vijayanagar Swimming Pool\" loc=\"Hampinagar 2nd Stage\" pc=\"560104\" state=\"Karnataka\" street=\"7th A Main Road 6th A Cross\" vtc=\"Bangalore North\"/><LData co=\"ತಂದೆ / ತಾಯಿಯ ಹೆಸರು: ಕೆ ವಿ ರಂಗನಾಥ್\" country=\" \" dist=\"ಬೆಂಗಳೂರು\" house=\"#300\" lang=\"07\" lm=\"ವಿಜಯನಗರ ಸ್ವಿಮ್ಮಿಂಗ್ ಪೂಲ್‌ನ ಹತ್ತಿರ\" loc=\"ಹಂಪಿನಗರ 2ನೇ ಹಂತ\" name=\"ಪವನ್ ರಂಗನಾಥ್\" pc=\"560104\" state=\"ಕರ್ನಾಟಕ\" street=\"7ನೇ ಏ ಮುಖ್ಯರಸ್ತೆ 6ನೇ ಏ ಅಡ್ದರಸ್ತೆ\" vtc=\"ಬೆಂಗಳೂರು ಉತ್ತರ\"/><Pht>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</Pht></UidData></KycRes></CertificateData><Signature xmlns=\"http://www.w3.org/2000/09/xmldsig#\">\n  <SignedInfo><CanonicalizationMethod Algorithm=\"http://www.w3.org/2001/10/xml-exc-c14n#\"/>\n    <SignatureMethod Algorithm=\"http://www.w3.org/2000/09/xmldsig#rsa-sha1\"/>\n  <Reference URI=\"\"><Transforms><Transform Algorithm=\"http://www.w3.org/2000/09/xmldsig#enveloped-signature\"/></Transforms><DigestMethod Algorithm=\"http://www.w3.org/2001/04/xmlenc#sha256\"/><DigestValue>uFDk43hOwIYXeacl+rOZzXb75eUZxJpYrgTVKC2xOXY=</DigestValue></Reference></SignedInfo><SignatureValue>MWaBZ2qDPrCcVWG7TLUZO+oUQBq4Sr+26dV1m2PYHouO6jkrm+LyCuYPn7FtzP8HF3X8jlUgxqrxI65YtuU+Op3kqL4c3t7JMojJfJEQ32LkMy/Eqw5JELCj1ILEiEycScVK5LM+NgNmqqunC2cBSW4y3SeuaCUfklXVBsGULyEjLXHDKDBT+/u6u6HnJiOQxaBnjtk6DqBoy6cPEu/U364nuwtXeWYLuzYcHT3nURcwJVE+oDrWhzKqpAXSitrynDFi4HlUka/nFr9/gLZsIYd/GIw+WjRXKeCNwW4H7UAh91a6hE9ynU25UTs9G97Yu4Nce+KC9v76eblSHhyRyw==</SignatureValue>\n<KeyInfo><X509Data><X509SubjectName>CN=DS NATIONAL E-GOVERNANCE DIVISION 1,ST=DELHI,postalCode=110003,OU=NATIONAL E-GOVERNANCE DIVISION,O=NATIONAL E-GOVERNANCE DIVISION,C=IN</X509SubjectName><X509Certificate>MIIFUjCCBDqgAwIBAgIHAJnuuyguVTANBgkqhkiG9w0BAQsFADB3MQswCQYDVQQGEwJJTjEiMCAGA1UEChMZU2lmeSBUZWNobm9sb2dpZXMgTGltaXRlZDEPMA0GA1UECxMGU3ViLUNBMTMwMQYDVQQDEypTYWZlU2NyeXB0IHN1Yi1DQSBmb3IgRG9jdW1lbnQgU2lnbmVyIDIwMjIwHhcNMjMwODIyMDgyMTQ2WhcNMjYwMjExMDc1NzI4WjCBrjELMAkGA1UEBhMCSU4xJzAlBgNVBAoTHk5BVElPTkFMIEUtR09WRVJOQU5DRSBESVZJU0lPTjEnMCUGA1UECxMeTkFUSU9OQUwgRS1HT1ZFUk5BTkNFIERJVklTSU9OMQ8wDQYDVQQREwYxMTAwMDMxDjAMBgNVBAgTBURFTEhJMSwwKgYDVQQDEyNEUyBOQVRJT05BTCBFLUdPVkVSTkFOQ0UgRElWSVNJT04gMTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBANOK+NVHpaQfOWhrtKHkN07+tVnWQ7cILkVSBTElDgalJsMBqvGv4NnsuCMCrMNtJs+kqvcIfbY210y9bj/WtMIv8EaQWzDInMeYKuP8QWdFa8oAkB1WLrJMy5naxE+99U4tHWk44497q783r168wT4av/XF0YSnkMBIeoZY5OewsQpOQCVSg9ouf1Uc3TwsBqomhJRPNxPK9QJ1gkfZQBwyTirXM6AHWVyzQY1GQWBXpAbMqSEqmvxrDHfC/g0I2SpDtJlUf59hTLUe5E+IrR2Xxls4QU3DqBS9GQAqc/O5wuRqw2j3OI3k7deZTmkaQDlbftYuBA3vUnndaRUgEjUCAwEAAaOCAakwggGlMBMGA1UdIwQMMAqACEzEC7kvPc60MBEGA1UdDgQKBAhHY4kJC0TLGDCBlwYIKwYBBQUHAQEEgYowgYcwRQYIKwYBBQUHMAKGOWh0dHBzOi8vd3d3LnNhZmVzY3J5cHRuZXcuY29tL1NhZmVTY3J5cHREb2NTaWduZXIyMDIyLmNlcjA+BggrBgEFBQcwAYYyaHR0cDovL29jc3Auc2FmZXNjcnlwdC5jb20vU2FmZVNjcnlwdERvY1NpZ25lcjIwMjIwRwYDVR0fBEAwPjA8oDqgOIY2aHR0cDovL2NybDIuc2FmZXNjcnlwdC5jb20vU2FmZVNjcnlwdERvY1NpZ25lcjIwMjIuY3JsMCcGA1UdIAQgMB4wCAYGYIJkZAIDMAgGBmCCZGQCAjAIBgZggmRkCgEwDAYDVR0TAQH/BAIwADAqBgNVHSUEIzAhBggrBgEFBQcDBAYJKoZIhvcvAQEFBgorBgEEAYI3CgMMMCUGA1UdEQQeMByBGmRuYXlha0BkaWdpdGFsaW5kaWEuZ292LmluMA4GA1UdDwEB/wQEAwIGwDANBgkqhkiG9w0BAQsFAAOCAQEAfmebPU8awacmsPZGr7M63sAuHdmbfIQDI3ZmUFBc0IRA1LSFcYCTDixhBXEYmpbB1gqSIC6kM2FsT42ZGwKaGZVBc/zryDJgJ8cr5EJyNA6cmRCk9fCSjXMvXJo4pZ1lSh+eAKWNbLkCdtFm4XZWpYU2UYI+wU6v5ZGWaNsNLOh05P9Eigoutfy0lhvZgE0gRXv8OgI6sSSJQW2uoVmUEDorX44cCqPLuCUIuq48G9xPpuHh2sH/RyVkAysGtN7TkmbZrqeVOSn+KVYbdyBWEF3zYUvPBndpXQUiKMG4kdYjvK08FZAfrF7fCYqyym+jKRBezoaS3AS67QiO4uTSyg==</X509Certificate><X509SubjectName>CN=CCA India 2022,O=India PKI,C=IN</X509SubjectName><X509Certificate>MIIFNDCCAxygAwIBAgIQdiQz69smdlqFYM0KqC/hFzANBgkqhkiG9w0BAQsFADA6MQswCQYDVQQGEwJJTjESMBAGA1UEChMJSW5kaWEgUEtJMRcwFQYDVQQDEw5DQ0EgSW5kaWEgMjAyMjAeFw0yMjAyMDIxMjA0MzdaFw00MjAyMDIxMjA0MzdaMDoxCzAJBgNVBAYTAklOMRIwEAYDVQQKEwlJbmRpYSBQS0kxFzAVBgNVBAMTDkNDQSBJbmRpYSAyMDIyMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAv3EBudWC8HY0oSwtJZCqpjQTGpEewl3EdDqUORV0qoFp78mdR/vuATXI83G7nF9RLvmNjgQgKr/bMx6gPO4Y57bMjAsgwEzleFclZka/sqc68iN5rS3huhrCX6MEINLyDOQ71MRA7GJCaNL6E3j1438eTu011mlikeZYBdkhvfpAVjCw90w8wcWDmqx66Y561T/RiXyz2uEhBBZAD43gV58eXStOeOTwAzEZYMrmp232GfmQKabYRfdIRus1avyuGea2nICEsRHE8M2tdzwpGP7oIy2qHBFJJ+3AwmwQA4DjmDkJtCD+58awohQavRNhqjsGD+ZifG3VR4i6WrKv8OWqZzcZj3g3Elr5+fRMlz1GSqkWPBw1Ev8KWTHazSUKF7OMxm3XzyXxQnw7fZF9GOVtx3adpfRPqYGgtbOP34EVkz4wsHvNMrvUrYcKymdOrnkTjlX26fIHUJpKGYkLk9q0jhMNKs4Rn8lj4pJ7YF33/ND4bjpV0ex1EAQz0iZvT37OnxNiuAZ/+4Djf075UuNX2ecWnadOrN1r8NAParZIwUoSUnWhU8TqAWWRqzFURHUZuOMQcA0geg4c9zqtBoUPgtQksbIAEsEXmDuRpwSIFjEkK11f5Eemfmfdg37KyIjQ67TRTmBA+kT9Q5JIm/e7m1ILg/HKckgLUOCnAMsCAwEAAaM2MDQwDwYDVR0TAQH/BAUwAwEB/zARBgNVHQ4ECgQITjtINlziX30wDgYDVR0PAQH/BAQDAgEGMA0GCSqGSIb3DQEBCwUAA4ICAQCdbE8d1c1DysKtrtYlApYIXTlY3N2XHNQ6gKoaVWsKa1TJ/ovrT+FV3bmQLet3aSoEG6pTe/vLZSg8WiF7cn7WuF4XlQS3yA2Uu8/cg/S4owqhQJp6K/Xg6UoSBad9Kog1H8deOfV8Nmb8a89zB4Yf8/AepId+Lr/3I6O7iub+PUT2QBXnksa+cf0yf+49GhyMCILZvctNSQd4Vxr9EgRvBARTrAgNQ9sEOJ6myOz4iTFR7T2pIFP8Cp15e8jEVI1q4IuHu3XlwJNk9f5k3gbwrzoy9P5rP8voQU3u9wh62JZa9U63b+u/Ur1tsKb5Lx0YUedtHvpIiIRurEPxumW0twjrx8TrAcXRrViSL7dsXAoYC0dXo154EE8jBAzgIIur7tJizxgXDEn4i2pu8Yd615YML9ii5BooEJ2j6fQ0nzyPRmx1Egw2Fjlgzzceai4TUOcaCKab86yyu5MZIp+BiPR840nw5MggbRgYH2nFRBA70toVm4VFlbZs3reGmaICm4ST6R395OxYS1iYBm5kXm9tLb4pkIhUxrkgyuiwE+DsWceBjHAYaXnCgUGKtiG9tfBMUw3fChoPb9L1yKdNof3zXDdTloMqEpO4BFrmjco8kt1v0LUQPhNZmQP4nqd4Hqx2384nPmWDXbQ+eePyxRteYGY0hJeDLVpyeYG8VQ==</X509Certificate><X509SubjectName>CN=SafeScrypt CA 2022,houseIdentifier=II Floor, Tidel Park,street=No.4, Rajiv Gandhi Salai,ST=Tamil Nadu,postalCode=600113,OU=Certifying Authority,O=Sify Technologies Limited,C=IN</X509SubjectName><X509Certificate>MIIFyzCCA7OgAwIBAgIQRwYH7tCkAM8CDtcmynPsqTANBgkqhkiG9w0BAQsFADA6MQswCQYDVQQGEwJJTjESMBAGA1UEChMJSW5kaWEgUEtJMRcwFQYDVQQDEw5DQ0EgSW5kaWEgMjAyMjAeFw0yMjAyMTYxMDUzNDhaFw0zMjAyMTYxMDUzNDhaMIHVMQswCQYDVQQGEwJJTjEiMCAGA1UEChMZU2lmeSBUZWNobm9sb2dpZXMgTGltaXRlZDEdMBsGA1UECxMUQ2VydGlmeWluZyBBdXRob3JpdHkxDzANBgNVBBETBjYwMDExMzETMBEGA1UECBMKVGFtaWwgTmFkdTEhMB8GA1UECRMYTm8uNCwgUmFqaXYgR2FuZGhpIFNhbGFpMR0wGwYDVQQzExRJSSBGbG9vciwgVGlkZWwgUGFyazEbMBkGA1UEAxMSU2FmZVNjcnlwdCBDQSAyMDIyMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqhUJbYvOXXCf/TT2UMLOI7HmLemOSWsQayMzc95KUL6KHGhAECDTWz07d1pSA6DhKUp49+uWOUMq/enOZKRQAtdBocQRDDev51FHSesSGVrPASLmxozR/ES4/AF11PyeHsefVMnkzKvK6cdAraK417DC4F6uCVM+wj/3kGl7COHqpEj1g5/XKkRlq/3PIL/4m7NLq2/TIcicgxUjHOSqtHrNW8vDdPD64c2yzMkozzjIZLu6Cv/Of+DGoN2oSiukWIaQx1VSijasJwykPx435I9sqzjaGja4yI5ox+NbjJnWGmwzncKLBVfkoP5c4whIJ9E+EF0DoZs/kXb+wWiMQwIDAQABo4IBLzCCASswEgYDVR0TAQH/BAgwBgEB/wIBATARBgNVHQ4ECgQIScvUu13lnDMwEgYDVR0gBAswCTAHBgVggmRkAjATBgNVHSMEDDAKgAhOO0g2XOJffTCBgAYIKwYBBQUHAQEEdDByMB4GCCsGAQUFBzABhhJodHRwOi8vb2N2cy5nb3YuaW4wUAYIKwYBBQUHMAKGRGh0dHA6Ly93d3cuY2NhLmdvdi5pbi9jY2Evc2l0ZXMvZGVmYXVsdC9maWxlcy9maWxlcy9DQ0FJbmRpYTIwMjIuY2VyMA4GA1UdDwEB/wQEAwIBBjBGBgNVHR8EPzA9MDugOaA3hjVodHRwOi8vY2NhLmdvdi5pbi9ydy9yZXNvdXJjZXMvQ0NBSW5kaWEyMDIyTGF0ZXN0LmNybDANBgkqhkiG9w0BAQsFAAOCAgEAnDRRXSvn13oweNwVHik4deI8Dq4blgsAn12qq8iOQwdweqQROakPy+Y8rUDG/UX+1D27XUorlc0rStD4/+c1nEXBXKvth1ij/hMzVn/8Lev0uWloGO3lUhfYLMOZgSf8EFSZoG7hotc4E9hj2AehKgfFPvJMBWNn7VsgimwBE4bDVLtn0dFVJWf22LN2CJmwx1MATtnIs0Bot0qLXbfDpq1oefh6vL+RR+XDfYaAsIOmuZD5Pm4cgJ4EKThcCm9s+IucjbzaZgSkyoe6NmKT1o3+l3W9u1jNR2ABS8yzjqLb6MqGCdewlasb1cltwl1LANENnDge7xEGkE4MHC5Oa0ihxEvkWrM+ko8QT9S4dwuQNa4rJx7Ak9sBgag8WHGHgyJTYvv1ViSnv7UA5GdCZyJwJro4HbenfNyU2iJ9b5ZMIX5OXbIDJtS6iCCt/DyaWAQW2riws3xea9+PfvO4M5en3GT6zCK3evIbcIo/uIp8WYNBPK2LKJulYpDWU2q8P0P3q6ykzRwhNTm47PoE3m7KubMHpCcFhNL7p7jTZCoLENt4zaAOCNeq/OVcVr9yTRM231ciiDyt6c1OCfF693zuUkl1Y7nORkQgTQDT0wKY7lgMKmZJ7w9fzgx+R4HHQr1dhE7pf5uLMKVFd//gsNZ4bgFdHu47YlGX3rQXXlo=</X509Certificate><X509SubjectName>CN=SafeScrypt sub-CA for Document Signer 2022,OU=Sub-CA,O=Sify Technologies Limited,C=IN</X509SubjectName><X509Certificate>MIIE/zCCA+egAwIBAgIGaS+ORfU0MA0GCSqGSIb3DQEBCwUAMIHVMQswCQYDVQQGEwJJTjEiMCAGA1UEChMZU2lmeSBUZWNobm9sb2dpZXMgTGltaXRlZDEdMBsGA1UECxMUQ2VydGlmeWluZyBBdXRob3JpdHkxDzANBgNVBBETBjYwMDExMzETMBEGA1UECBMKVGFtaWwgTmFkdTEhMB8GA1UECRMYTm8uNCwgUmFqaXYgR2FuZGhpIFNhbGFpMR0wGwYDVQQzExRJSSBGbG9vciwgVGlkZWwgUGFyazEbMBkGA1UEAxMSU2FmZVNjcnlwdCBDQSAyMDIyMB4XDTIyMDIxODAzNTUyOVoXDTMyMDIxNjA5NTM0OFowdzELMAkGA1UEBhMCSU4xIjAgBgNVBAoTGVNpZnkgVGVjaG5vbG9naWVzIExpbWl0ZWQxDzANBgNVBAsTBlN1Yi1DQTEzMDEGA1UEAxMqU2FmZVNjcnlwdCBzdWItQ0EgZm9yIERvY3VtZW50IFNpZ25lciAyMDIyMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvEFENGRPNl5cZxGZfsOCVL3JIXp2yQpUkwHK1Lgp1GTihg2nfB0wnjrC1rLN12DQ1IdN/b1twM62WROKwJqKAXWMLAzhx5dcOZpBoY/sFILLlZnd4yYC8p1GPz7QJ30vuBeLSCSx6vVqZFIjuJce9Rrn2IHg4asTbzQ033obSdI+d9ghsULSHHbx2ZOA/S8NGGc4242EOemN/hCHfWr4QqvrLI6e4qPDpDPUs2QxvFEflTmxiMGnaMFCC20qE5Sf50kzNFsP9L7siFUNxOdQsE+j9BpVxBYMs3p3XPwjaEqaqa/aa+mmEOCDiRs10wPT8p3nDEi5GAl0ui2ypTYTlwIDAQABo4IBMDCCASwwEwYDVR0jBAwwCoAIScvUu13lnDMwEQYDVR0OBAoECEzEC7kvPc60MIGHBggrBgEFBQcBAQR7MHkwPgYIKwYBBQUHMAKGMmh0dHBzOi8vd3d3LnNhZmVzY3J5cHRuZXcuY29tL1NhZmVTY3J5cHRDQTIwMjIuY2VyMDcGCCsGAQUFBzABhitodHRwOi8vb2NzcC5zYWZlc2NyeXB0LmNvbS9TYWZlU2NyeXB0Q0EyMDIyMEAGA1UdHwQ5MDcwNaAzoDGGL2h0dHA6Ly9jcmwyLnNhZmVzY3J5cHQuY29tL1NhZmVTY3J5cHRDQTIwMjIuY3JsMBIGA1UdIAQLMAkwBwYFYIJkZAIwEgYDVR0TAQH/BAgwBgEB/wIBADAOBgNVHQ8BAf8EBAMCAQYwDQYJKoZIhvcNAQELBQADggEBAKm3ERUBAd0brn8VmeXUcBZExQWZfHmgRQGbgRctQ6n1Yf+DJoGO9maQPuUEcaen7Deoc2SE+iaX182CF4XVjV5I6iGRjuowDaWn0K4qgd5a92/7vSKt7DL8uqAXYxFzXCTA1DuKYlV6k4+A18nX+/wVMTVgLqiUIuccvoS+sVXXf7440O/Qtr+YehIN6raPaXAdsfvCWczpQOMSM3Bv2jmU2j7aM0cFKRxPa5CtQ7Y2/yEIPqk1+ZwsqOCdc9vT6q2JkjgpgPF7zvEliTvFdWKAExlada3GEcJQ/bpXLPs1Pqm9qGDd33WHXh92NS3OAJ8volK7CiOIK2dmgDmHOts=</X509Certificate></X509Data></KeyInfo></Signature></Certificate>",
        "digiLockerUserInfo" : {
            "iss" : "https://digilocker.meripehchaan.gov.in",
            "sub" : "pavanranganath",
            "aud" : "NR6A57AE2F",
            "iat" : NumberInt(1696331173),
            "exp" : NumberInt(1696417573),
            "auth_time" : NumberInt(1696331173),
            "given_name" : "Pavan Ranganath",
            "preferred_username" : "pavanranganath",
            "email" : "pavanranganath94@gmail.com",
            "gender" : "M",
            "birthdate" : "09/07/1994T00:00:00.000000Z",
            "phone_number" : "7259531426",
            "jti" : "ab45a5d7-4c30-4f69-afb7-9fb398af2f0e",
            "user_sso_id" : "DL-a9e09983-6d93-11e9-a85e-9457a5645068",
            "pan_number" : "",
            "driving_licence" : "",
            "masked_aadhaar" : "xxxxxxxx8328",
            "reference_key" : "df20cd10829bfef3075a7169c5afd5a99f92cf69f750af26fa03f6cf58c229a1",
            "auth_txn" : "651bf34e5f3f9oauth21696330574",
            "auth_mode" : "DL_MOBILE_PIN"
        }
    }
 * @param digiLockerID 
 * @returns 
 */
export async function checkDigiLockerID(user_sso_id: string, userId: string) {
  const collection = mongoose.connection.db.collection("credentials");
  const digiLockerIDDoc = await collection.findOne({
    "aadhaar.digiLockerUserInfo.user_sso_id": user_sso_id,
    userID: { $ne: userId },
  });
  if (digiLockerIDDoc) {
    // The document with the specified user_sso_id exists
    return true;
  }
  // The document with the specified user_sso_id does not exist
  return false;
}
