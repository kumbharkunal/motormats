import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

/** Mirrors the dashboard's grid so nothing shifts when the data lands. */
export default function AdminDashboardLoading() {
  return (
    <Stack spacing={2.5} aria-busy="true">
      <Skeleton variant="text" width={220} height={42} />

      <Grid container spacing={2}>
        {Array.from({ length: 4 }, (_, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Skeleton variant="rounded" height={132} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Skeleton variant="rounded" height={356} />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Skeleton variant="rounded" height={356} />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Skeleton variant="rounded" height={280} />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Skeleton variant="rounded" height={280} />
        </Grid>
      </Grid>

      <Card sx={{ p: 2.5 }}>
        <Skeleton variant="text" width={140} height={26} sx={{ mb: 2 }} />
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} variant="text" height={38} />
        ))}
      </Card>
    </Stack>
  );
}
