import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';

/** One header shape for every admin page, so the panel reads as one product. */
export function PageHeader({
  title,
  subtitle,
  count,
}: {
  title: string;
  subtitle: string;
  count?: number;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 2,
        flexWrap: 'wrap',
      }}
    >
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="h4" sx={{ fontSize: { xs: 24, md: 30 } }}>
            {title}
          </Typography>
          {count === undefined ? null : (
            <Chip size="small" label={count} sx={{ fontVariantNumeric: 'tabular-nums' }} />
          )}
        </Box>
        <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
          {subtitle}
        </Typography>
      </Box>
    </Box>
  );
}
