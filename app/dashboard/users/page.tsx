"use client"
import { Suspense, useMemo, useState } from 'react';
import MaterialReactTable, { MRT_ColumnDef, MRT_ColumnFiltersState, MRT_PaginationState, MRT_SortingState } from 'material-react-table';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { Tooltip, IconButton, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { ProtectedLayout } from '@/components/protectedLayouts/protectedLayout';
import { User, credentailsFromTb, dataFromServer } from './service';

const UsersTable = () => {

    const columns = useMemo<MRT_ColumnDef<credentailsFromTb>[]>(
        () => [

            {
                accessorKey: 'userID',
                header: 'Email',
                enableHiding: false
            },
            {
                accessorFn(originalRow) {
                    return originalRow?.userInfo?.firstName
                },
                enableColumnFilter: false,
                enableSorting: false,
                header: 'First Name',
            },
            {
                accessorFn(originalRow) {
                    return originalRow?.userInfo?.lastName
                },
                enableColumnFilter: false,
                enableSorting: false,
                header: 'Last Name'
            }
        ],
        [],
    );
    const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
        [],
    );
    const [globalFilter, setGlobalFilter] = useState('');
    const [sorting, setSorting] = useState<MRT_SortingState>([]);
    const [pagination, setPagination] = useState<MRT_PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const { data, isError, isFetching, isLoading, refetch } =
        useQuery<dataFromServer>({
            queryKey: [
                'table-data',
                columnFilters, //refetch when columnFilters changes
                // globalFilter, //refetch when globalFilter changes
                pagination.pageIndex, //refetch when pagination.pageIndex changes
                pagination.pageSize, //refetch when pagination.pageSize changes
                sorting, //refetch when sorting changes
            ],
            queryFn: async () => {
                const fetchURL = new URL(
                    '/api/users',
                    process.env.NODE_ENV === 'production'
                        ? process.env.HOST
                        : 'http://localhost:3000',
                );
                fetchURL.searchParams.set(
                    'limit',
                    `${pagination.pageSize}`,
                );
                fetchURL.searchParams.set('page', `${pagination.pageIndex}`);
                fetchURL.searchParams.set(
                    'filters',
                    JSON.stringify(columnFilters ?? []),
                );
                // fetchURL.searchParams.set('globalFilter', globalFilter ?? '');
                fetchURL.searchParams.set('sorting', JSON.stringify(sorting ?? []));

                const response = await fetch(fetchURL.href);
                const json = (await response.json()) as dataFromServer;
                return json;
            },
            keepPreviousData: true,
        });

    return (
        <MaterialReactTable
            columns={columns}
            data={data?.data ?? []} //data is undefined on first render
            initialState={{ showColumnFilters: false }}
            manualFiltering
            manualPagination
            manualSorting
            getRowId={(row) => row._id!}
            muiToolbarAlertBannerProps={
                isError
                    ? {
                        color: 'error',
                        children: 'Error loading data',
                    }
                    : undefined
            }
            onColumnFiltersChange={setColumnFilters}
            // onGlobalFilterChange={setGlobalFilter}
            onPaginationChange={setPagination}
            onSortingChange={setSorting}
            renderTopToolbarCustomActions={() => (
                <>
                    <Tooltip arrow title="Refresh Data">
                        <IconButton onClick={() => refetch()}>
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </>

            )}
            rowCount={data?.totalCount ?? 0}
            state={{
                columnFilters,
                // globalFilter,
                isLoading,
                pagination,
                showAlertBanner: isError,
                showProgressBars: isFetching,
                sorting,
            }}
            enableColumnResizing
            enableRowNumbers
            enableStickyHeader
        // muiTableBodyRowProps={({ row }) => ({
        //     onClick: (event) => {
        //         console.info(event, row);
        //     },
        //     sx: {
        //         cursor: 'pointer', //you might want to change the cursor too when adding an onClick
        //     },
        // })}
        />
    )
}
export default async function users() {
    const queryClient = new QueryClient();

    return (
        <ProtectedLayout>
            <QueryClientProvider client={queryClient}>
                <UsersTable />
            </QueryClientProvider>
        </ProtectedLayout>
    );
}
