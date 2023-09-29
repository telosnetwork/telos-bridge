import {StargateConfig, StargateConfigLike, toConfig} from '@layerzerolabs/ui-stargate-sdk';
import http from 'axios';

export async function getStargateConfig({
  partnerId,
}: {partnerId?: number} = {}): Promise<StargateConfig> {
  const {data} = await http.get<StargateConfigLike>('https://api.stargate.finance/api/v1/config', {
    params: {partnerId},
  });

  return toConfig(data);
}
