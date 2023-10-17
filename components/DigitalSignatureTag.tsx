import { pki } from 'node-forge';
import React from 'react';

function DigitalSignatureTag({ certificate, signedDate }: { certificate: pki.Certificate, signedDate: Date }) {
    const organizationName = certificate.subject.getField('O').value || 'Unknown Organization';

    return (
        <div style={{ border: '1px solid', padding: '10px', borderRadius: '5px', maxWidth: '300px' }}>
            <strong>Digitally signed by</strong> <br />
            {organizationName} <br />
            Date: {signedDate.toDateString()}
        </div>
    );
}

export default DigitalSignatureTag;
