"use client"

import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
export type dataFromServer = {
    data: Users[];
    totalCount: number;
    limit: number;
    totalPages: number;
}
export type Users = {
    fName?: string;
    lName?: string;
    email?: string;
    _id?: string;
}

// Albums Component
export async function UsersTable({ users }: { users: dataFromServer }) {
    const { data } = users
    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>No.</TableCell>
                        <TableCell>Firstname</TableCell>
                        <TableCell align="right">Lastname</TableCell>
                        <TableCell align="right">Email</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((row: any, index) => (
                        <TableRow
                            key={row._id}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row">{index + 1}</TableCell>
                            <TableCell component="th" scope="row">
                                {row.fName}
                            </TableCell>
                            <TableCell align="right">{row.lName}</TableCell>
                            <TableCell align="right">{row.email}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}