import {
  styled,
} from '@mui/material/styles';

import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

export const HighlightUL = styled('ul')(({theme}) => ({
  color: theme.palette.secondary.main,
}));

export const HighlightSpan = styled('span')(({theme}) => ({
  color: theme.palette.secondary.main,
}));

export const HighlightType = styled(Typography)(({theme}) => ({
  color: theme.palette.secondary.main,
}));

export const HighlightLink = styled(Link)(({theme}) => ({
  color: theme.palette.secondary.main,
}));

