import React from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Typography, Accordion, AccordionSummary, AccordionDetails, Box } from "@mui/material";

const FAQComponent = () => {
  const faqItems = [
    {
      section: "Authentication",
      question: "What is a passkey, and why is it important?",
      answer:
        "A passkey is a digital credential, tied to a user account and a website or application. Passkeys allow users to authenticate without having to enter a username or password, or provide any additional authentication factor. This technology aims to replace legacy authentication mechanisms such as passwords",
    },
    {
      section: "Authentication",
      question: "Can I use multiple passkeys for the same account?",
      answer:
        "By adding a new passkey to your account, you can access your account from different devices or locations. This means you can have multiple passkeys for the same account, offering greater flexibility while maintaining a strong level of protection. This approach enhances security and convenience, allowing you to tailor your authentication process to your specific needs.",
    },
    {
      section: "Zero Knowledge Proof (ZKP)",
      question: "What is a Zero Knowledge Proof (ZKP)?",
      answer:
        "A Zero Knowledge Proof is a cryptographic protocol that allows one party to prove knowledge of a secret without revealing the secret itself to another party.",
    },
    {
      section: "Zero Knowledge Proof (ZKP)",
      question: "What are the three essential properties of ZKPs?",
      answer:
        "ZKPs must satisfy three properties: completeness (the prover convinces the verifier when the statement is true), soundness (the prover fails to convince the verifier when the statement is false), and zero-knowledge (the verifier learns nothing beyond the statement's truth).",
    },
    {
      section: "XML Signatures",
      question: "What is an XML signed certificate?",
      answer:
        "An XML signed certificate is a digital certificate applied to XML data to ensure its integrity and authenticity. It uses digital signatures for validation.",
    },
    {
      section: "XML Signatures",
      question: "How does the verification process of an XML signed certificate work?",
      answer:
        "To verify an XML signed certificate, the recipient typically uses the issuer's public key to check the validity of the digital signature. If the signature is valid, the data is considered secure and unaltered.",
    },
    {
      section: "More Questions",
      question: "Still work in progress",
      answer:
        "We are still working on this page. Please check back later for more questions and answers.",
    },
  ];

  // Group FAQ items by section
  type FAQItem = {
    section: string;
    question: string;
    answer: string;
  };

  const groupedFAQ: { [key: string]: FAQItem[] } = {};
  faqItems.forEach((item) => {
    if (!groupedFAQ[item.section]) {
      groupedFAQ[item.section] = [];
    }
    groupedFAQ[item.section].push(item);
  });

  return (
    <Box mt={4} mb={4}>
      {Object.keys(groupedFAQ).map((section, index) => (
        <Box key={index} mb={4}>
          <Typography variant="h5" gutterBottom>
            {section}
          </Typography>
          {groupedFAQ[section].map((item, itemIndex) => (
            <Accordion
              key={itemIndex}
              style={{ marginBottom: "16px", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", borderRadius: "6px" }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel${itemIndex}-content`}
                id={`panel${itemIndex}-header`}
              >
                <Typography variant="body1">{item.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{item.answer}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      ))}
    </Box>
  );
};

export default FAQComponent;
