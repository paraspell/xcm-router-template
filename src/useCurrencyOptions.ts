import type { TAssetInfo, TChain, TSubstrateChain } from "@paraspell/sdk";
import { useMemo } from "react";
import type { TExchangeInput, TExchangeChain } from "@paraspell/xcm-router";
import {
  getSupportedAssetsFrom,
  getSupportedAssetsTo,
} from "@paraspell/xcm-router";

// This hook is used to get the currency options
// for the currencyFrom and currencyTo fields in the transfer form.
const useCurrencyOptions = (
  from: TSubstrateChain | undefined,
  exchangeChain: TExchangeChain[],
  to: TChain | undefined
) => {
  // Transform exchange so that when its only one items it is not an array
  const exchange = exchangeChain.length > 1 ? exchangeChain : exchangeChain[0];

  // Get the supported assets for the currencyFrom field
  const supportedAssetsFrom = useMemo(
    () => getSupportedAssetsFrom(from, exchange as TExchangeInput),
    [from, exchangeChain]
  );

  // Get the supported assets for the currencyTo field
  const supportedAssetsTo = useMemo(
    () => getSupportedAssetsTo(exchange as TExchangeInput, to),
    [exchangeChain, to]
  );

  // Create a map of the supported assets for the currencyFrom field
  const currencyFromMap = useMemo(
    () =>
      supportedAssetsFrom.reduce((map: Record<string, TAssetInfo>, asset) => {
        const key = `${asset.symbol ?? "NO_SYMBOL"}-${
          "assetId" in asset ? asset.assetId : "NO_ID"
        }`;

        map[key] = asset;
        return map;
      }, {}),
    [supportedAssetsFrom]
  );

  // Create a map of the supported assets for the currencyTo field
  const currencyToMap = useMemo(
    () =>
      supportedAssetsTo.reduce((map: Record<string, TAssetInfo>, asset) => {
        const key = `${asset.symbol ?? "NO_SYMBOL"}-${
          "assetId" in asset ? asset.assetId : "NO_ID"
        }`;
        map[key] = asset as TAssetInfo;
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
          "assetId" in currencyFromMap[key] ||
          "location" in currencyFromMap[key]
            ? "assetId" in currencyFromMap[key]
              ? currencyFromMap[key].assetId
              : "Location"
            : "Native"
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
          "assetId" in currencyToMap[key] || "location" in currencyToMap[key]
            ? "assetId" in currencyToMap[key]
              ? currencyToMap[key].assetId
              : "Location"
            : "Native"
        }`,
      })),
    [currencyToMap]
  );

  return {
    currencyFromOptions,
    currencyToOptions,
    currencyFromMap,
    currencyToMap,
  };
};

export default useCurrencyOptions;
