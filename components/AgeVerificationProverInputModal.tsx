import { yupResolver } from "@hookform/resolvers/yup";
import { Modal, DialogTitle, DialogContent, TextField, DialogContentText, Button } from "@mui/material";
import { Box } from "@mui/system";
import moment from "moment";
import { useForm } from "react-hook-form";
import * as yup from "yup";

import PropTypes from "prop-types";
import { dateOfBirthToUTCTimestamp, dateToEpoch } from "@/lib/services/utils";

interface AgeverificationProverInputModalProps {
  open: boolean;
  onClose: (formData: any) => void; // Callback to send form data to parent
}
// Validation schema for registration form
const ageVerificationProverForm = {
  claimDate: yup.date().required("Date is required"),
  claimAge: yup.number().required("Age is required"),
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

export const AgeverificationProverInputModal: React.FC<AgeverificationProverInputModalProps> = ({ open, onClose }) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, touchedFields },
    watch, // Add the watch function to access form input values
  } = useForm({
    resolver: yupResolver(yup.object().shape(ageVerificationProverForm)),
  });
  function onSubmit(dataFromUser: any) {
    const dobFormatted = moment(watch("claimDate")).format("YYYY-MM-DD");
    const formData = {
      claimDate: dateToEpoch(dobFormatted),
      claimAge: watch("claimAge"),
    };
    handleClose(formData);
  }
  const handleClose = (formData: { claimDate: number; claimAge: number } | null) => {
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
          <DialogTitle>Generate Proof for Age verification</DialogTitle>

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
                {...register("claimDate")}
                error={touchedFields.claimDate && Boolean(errors.claimDate)}
                helperText={
                  errors.claimDate?.message
                    ? errors.claimDate?.message
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
                {...register("claimAge")}
                error={touchedFields.claimAge && Boolean(errors.claimAge)}
                helperText={errors.claimAge?.message ? errors.claimAge?.message : "Enter Age"}
                sx={{ mb: 2 }}
              />
              <DialogContentText sx={{ marginBottom: 2 }}>
                Claim Statement:{" "}
                {`On ${watch("claimDate") || "____-__-__"}, the age is equal to or below ${watch("claimAge") || "___"}`}
              </DialogContentText>

              {/* Submit button */}
              <Button variant="contained" color="primary" type="submit">
                Generate Proof
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

AgeverificationProverInputModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
