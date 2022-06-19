import {
  styled,
} from '@mui/material/styles';

import Typography from '@mui/material/Typography';

export const Title = styled(Typography)(({theme}) => ({
  color: theme.palette.secondary.main,
  fontFamily: 'Mali',
  fontStyle: 'italic',
  fontWeight: 500,
}));
