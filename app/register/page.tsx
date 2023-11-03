"use client";

import * as yup from "yup"; // Yup library for form validation
import { yupResolver } from "@hookform/resolvers/yup"; // Resolver for Yup validation with React Hook Form
import { Controller, useForm } from "react-hook-form"; // Form management library
import LoadingSpinner from "@/components/Loading";
import { Typography, TextField, Button } from "@mui/material";
import Link from "next/link";
import { MuiTelInput, matchIsValidTel } from "mui-tel-input";
import { useState } from "react";

export default function Dashboard(): JSX.Element {
  const [loadingMessage, setLoadingMessage] = useState<string>("");

  const registerForm = {
    name: yup.string().required("Full name is required"),
    email: yup.string().required("Email is required").email("Invalid email format"),
    phone: yup.string().required("A Mobile number is required"),
    role: yup.string().required("Role is required"),
    description: yup.string().required("Description is required"),
    extra: yup.string(),
    photo: yup.mixed().required("Required"),
  };
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, touchedFields },
    reset, // Add the reset function from react-hook-form
  } = useForm({
    resolver: yupResolver(yup.object().shape(registerForm)),
  });
  // Form submission handler
  async function onSubmit(data: any) {
    setLoadingMessage("Registering...");
    // Check if a photo file is selected
    if (data.photo[0]) {
      const photoFile = data.photo[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        if (e.target) {
          const base64Data = e.target.result as string;

          // Create a new object by cloning the 'data' object and modifying the 'photo' property
          const modifiedData = { ...data, photo: base64Data };

          // Send the modified data to the server
          sendRegistrationData(modifiedData);
        }
      };

      // Read the photo file as a base64 string
      reader.readAsDataURL(photoFile);
    }
  }

  async function sendRegistrationData(data: any) {
    console.log("data", data);
    const response = await fetch("/api/users", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const json = await response.json();
    console.log("json", json);
    if (!response.ok) {
      console.error("error", json);
      alert("Error: Could not register user");
    } else {
      alert("User registered successfully");
      // reset form
      reset();
    }

    setLoadingMessage("");
  }
  return (
    <>
      {/* Registration form */}
      <Typography component="h1" variant="h5" sx={{ marginBottom: 2 }}>
        Registration
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
        {/* Full Name field */}
        <TextField
          id="name"
          type="text"
          variant="outlined"
          color="primary"
          label="Full Name (Firstname and Lastname)"
          fullWidth
          {...register("name")}
          error={touchedFields.name && Boolean(errors.name)}
          helperText={touchedFields.name ? errors.name?.message : ""}
          sx={{ mb: 2 }}
        />
        {/* Email field */}
        <TextField
          type="email"
          variant="outlined"
          color="primary"
          label="Email"
          {...register("email")}
          error={touchedFields.email && Boolean(errors.email)}
          helperText={touchedFields.email ? errors.email?.message : ""}
          fullWidth
          sx={{ mb: 2 }}
        />
        {/* Phone field */}
        <Controller
          name="phone"
          control={control}
          rules={{
            validate: (value) => {
              console.log("value", value);
              return matchIsValidTel(value) || "Invalid mobile number";
            },
          }}
          render={({ field: { ref, ...field } }) => (
            <MuiTelInput
              disableDropdown
              inputRef={ref}
              inputProps={{ readOnly: false }}
              {...field}
              color="primary"
              defaultCountry="US"
              variant="outlined"
              // onlyCountries={["US", "IN"]}
              // onlyCountries={["IN"]}
              label="Mobile Number"
              error={!!errors.phone}
              helperText={errors.phone?.message}
              fullWidth
              sx={{ mb: 2 }}
            />
          )}
        />
        {/* Role field */}
        <TextField
          type="text"
          variant="outlined"
          color="primary"
          label="Role"
          {...register("role")}
          error={touchedFields.role && Boolean(errors.role)}
          helperText={touchedFields.role ? errors.role?.message : ""}
          fullWidth
          sx={{ mb: 2 }}
        />
        {/* Description field */}
        <TextField
          type="text"
          variant="outlined"
          color="primary"
          label="Description"
          {...register("description")}
          error={touchedFields.description && Boolean(errors.description)}
          helperText={touchedFields.description ? errors.description?.message : ""}
          fullWidth
          sx={{ mb: 2 }}
        />
        {/* Extra field */}
        <TextField
          type="text"
          variant="outlined"
          color="primary"
          label="Extra"
          {...register("extra")}
          error={touchedFields.extra && Boolean(errors.extra)}
          helperText={touchedFields.extra ? errors.extra?.message : ""}
          fullWidth
          sx={{ mb: 2 }}
        />
        {/* Photo field */}
        <TextField
          type="file"
          variant="outlined"
          color="primary"
          label="Photo"
          {...register("photo")}
          error={touchedFields.photo && Boolean(errors.photo)}
          helperText={touchedFields.photo ? errors.photo?.message : ""}
          fullWidth
          sx={{ mb: 2 }}
        />
        {/* Submit button */}
        <Button variant="contained" color="primary" type="submit">
          Register
        </Button>
      </form>

      {/* Sign-in link */}

      {loadingMessage && <LoadingSpinner message={loadingMessage} />}
    </>
  );
}
