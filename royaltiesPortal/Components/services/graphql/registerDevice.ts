import { gql } from '@apollo/client';

export const REGISTER_DEVICE = gql`
  mutation MyMutation($deviceToken: String!, $deviceType: String!) {
    registerDevice(
      request: { deviceToken: $deviceToken, deviceType: $deviceType }
    )
  }
`;
