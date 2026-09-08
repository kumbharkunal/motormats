import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

/** Shared skeleton for the admin list routes; matches the header + table shape. */
export function TableLoading() {
  return (
    <Stack spacing={2.5} aria-busy="true">
      <Stack spacing={0.5}>
        <Skeleton variant="text" width={180} height={42} />
        <Skeleton variant="text" width={320} height={20} />
      </Stack>

      <Card sx={{ p: 2.5 }}>
        <Skeleton variant="text" height={44} />
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton key={index} variant="text" height={52} />
        ))}
      </Card>
    </Stack>
  );
}
