import type { TAsset, TNodeWithRelayChains } from "@paraspell/sdk";
import { useMemo } from "react";
import type { TAutoSelect, TExchangeNode } from "@paraspell/xcm-router";
import {
  getSupportedAssetsFrom,
  getSupportedAssetsTo,
} from "@paraspell/xcm-router";

// This hook is used to get the currency options
// for the currencyFrom and currencyTo fields in the transfer form.
const useCurrencyOptions = (
  from: TNodeWithRelayChains,
  exchangeNode: TExchangeNode | TAutoSelect,
  to: TNodeWithRelayChains
) => {
  // Get the supported assets for the currencyFrom field
  const supportedAssetsFrom = useMemo(
    () => getSupportedAssetsFrom(from, exchangeNode),
    [from, exchangeNode]
  );

  // Get the supported assets for the currencyTo field
  const supportedAssetsTo = useMemo(
    () => getSupportedAssetsTo(from, exchangeNode, to),
    [exchangeNode, to]
  );

  // Create a map of the supported assets for the currencyFrom field
  const currencyFromMap = useMemo(
    () =>
      supportedAssetsFrom.reduce((map: Record<string, TAsset>, asset) => {
        const key = `${asset.symbol ?? "NO_SYMBOL"}-${
          asset.assetId ?? "NO_ID"
        }`;
        map[key] = asset;
        return map;
      }, {}),
    [supportedAssetsFrom]
  );

  // Create a map of the supported assets for the currencyTo field
  const currencyToMap = useMemo(
    () =>
      supportedAssetsTo.reduce((map: Record<string, TAsset>, asset) => {
        const key = `${asset.symbol ?? "NO_SYMBOL"}-${
          asset.assetId ?? "NO_ID"
        }`;
        map[key] = asset;
        return map;
      }, {}),
    [supportedAssetsTo]
  );

  // Create the select options for the currencyFrom field
  const currencyFromOptions = useMemo(
    () =>
      Object.keys(currencyFromMap).map((key) => ({
        value: key,
        label: `${currencyFromMap[key].symbol} - ${
          currencyFromMap[key].assetId ?? "Native"
        }`,
      })),
    [currencyFromMap]
  );

  // Create the select options for the currencyTo field
  const currencyToOptions = useMemo(
    () =>
      Object.keys(currencyToMap).map((key) => ({
        value: key,
        label: `${currencyToMap[key].symbol} - ${
          currencyToMap[key].assetId ?? "Native"
        }`,
      })),
    [currencyToMap]
  );

  const isFromNotParaToPara = from === "Polkadot" || from === "Kusama";
  const isToNotParaToPara = to === "Polkadot" || to === "Kusama";

  return {
    currencyFromOptions,
    currencyToOptions,
    currencyFromMap,
    currencyToMap,
    isFromNotParaToPara,
    isToNotParaToPara,
  };
};

export default useCurrencyOptions;
