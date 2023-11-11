// ReusableDialog.tsx

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, ButtonPropsColorOverrides } from '@mui/material';
import React, { FC, ReactNode } from 'react';
import { OverridableStringUnion } from '@mui/types';

interface Action {
    label: string;
    onClick: () => void;

}

interface ReusableDialogProps {
    open: boolean;
    onClose: () => void;
    title: string;
    content: ReactNode;
    actions: Action[];
}

const ReusableDialog: FC<ReusableDialogProps> = ({
    open,
    onClose,
    title,
    content,
    actions,
}) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>{content}</DialogContent>
            <DialogActions>
                {actions.map((action, index) => (
                    <Button key={index} onClick={action.onClick} color="primary">
                        {action.label}
                    </Button>
                ))}
            </DialogActions>
        </Dialog>
    );
};

export default ReusableDialog;
