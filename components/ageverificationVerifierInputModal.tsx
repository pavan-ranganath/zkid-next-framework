import React, { useState } from "react";
import {
  Button,
  Modal,
  TextField,
  Typography,
  Box,
  DialogTitle,
  DialogContentText,
  DialogContent,
  DialogActions,
} from "@mui/material";
import * as yup from "yup"; // Yup library for form validation
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { AgeVerificatingCertificate } from "@/lib/interfaces/Certificate.interface";
import { epochToDate } from "@/lib/services/utils";
import moment from "moment";

interface AgeverificationVerifierInputModalProps {
  open: boolean;
  onClose: (formData: any) => void; // Callback to send form data to parent
  data: AgeVerificatingCertificate;
}

// Validation schema for registration form
const ageVerificationVerifierForm = {
  date: yup.date().required("Date is required"),
  age: yup.number().required("Age is required"),
};
const centerModalStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 9999, // Adjust the z-index as needed
};

export const AgeverificationVerifierInputModal: React.FC<AgeverificationVerifierInputModalProps> = ({
  open,
  onClose,
  data,
}) => {
  // Configuring the useForm hook with the validation resolver:
  // - resolver: yupResolver from the yup library is used to integrate Yup validation with React Hook Form
  // - yupResolver takes the validation schema (ageVerificationVerifierForm)
  // - This configuration ensures that the form inputs are validated according to the defined rules in registerForm
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, touchedFields },
    watch, // Add the watch function to access form input values
  } = useForm({
    resolver: yupResolver(yup.object().shape(ageVerificationVerifierForm)),
  });
  // Form submission handler
  function onSubmit(dataFromUser: any) {
    console.log("data submitted", dataFromUser);
    const issuedDate = moment.unix(+data.Certificate.CertificateData.ZKPROOF.claimedDate / 1000).startOf("day");
    const dateRequirementFromUser = moment(dataFromUser.date).startOf("day");
    // check dateRequirementFromUser is less than or equal to issuedDate
    if (dateRequirementFromUser.isBefore(issuedDate)) {
      alert("This proof does not align with your specified requirements.");
      return;
    }
    // check age
    // check age is less than to data.Certificate.IssuedTo.Person.age
    const claimedAge = +data.Certificate.CertificateData.ZKPROOF.claimedAge;
    if (+dataFromUser.age > +data.Certificate.CertificateData.ZKPROOF.claimedAge) {
      alert("This proof does not align with your specified requirements.");
      return;
    }
    const formData = {
      date: issuedDate.toDate(),
      age: claimedAge,
    };
    handleClose(formData);
  }

  const handleClose = (formData: { date: Date; age: number } | null) => {
    // Trigger the callback and send form data to the parent component

    onClose(formData);
  };

  return (
    <Modal open={open}>
      <div style={centerModalStyle}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "background.paper",
            margin: "auto",
            textAlign: "center",
          }}
        >
          <DialogTitle> Enter Details</DialogTitle>

          <DialogContent>
            {/* Registration form */}
            <form onSubmit={handleSubmit(onSubmit)} style={{ paddingTop: 20 }}>
              {/* Date field */}
              <TextField
                id="date"
                type="date"
                variant="outlined"
                color="primary"
                label="Enter Date"
                InputLabelProps={{ shrink: true }}
                {...register("date")}
                error={touchedFields.date && Boolean(errors.date)}
                helperText={
                  errors.date?.message
                    ? errors.date?.message
                    : "Please provide the date you wish to compare and verify the age for."
                }
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                id="age"
                type="number"
                variant="outlined"
                color="primary"
                label="Age"
                fullWidth
                {...register("age")}
                error={touchedFields.age && Boolean(errors.age)}
                helperText={errors.age?.message ? errors.age?.message : "Enter Age"}
                sx={{ mb: 2 }}
              />
              <DialogContentText sx={{ marginBottom: 2 }}>
                {`On ${watch("date") || "____-__-__"}, the age of '${data?.Certificate.IssuedTo.Person
                  .name}' is equal to or below ${watch("age") || "___"} ?`}
              </DialogContentText>

              {/* Submit button */}
              <Button variant="contained" color="primary" type="submit">
                Verify Proof
              </Button>
              <Button variant="contained" color="primary" onClick={() => handleClose(null)} sx={{ marginLeft: 2 }}>
                Cancel
              </Button>
            </form>
          </DialogContent>
        </Box>
      </div>
    </Modal>
  );
};
