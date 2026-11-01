"use strict";

const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector("#primary-links");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    navLinks.classList.toggle("is-open", !expanded);
  });
}

const calculator = document.querySelector("#salt-calculator");

if (calculator) {
  const vegetableInput = document.querySelector("#vegetable-weight");
  const vegetableUnit = document.querySelector("#vegetable-unit");
  const waterInput = document.querySelector("#water-weight");
  const waterUnit = document.querySelector("#water-unit");
  const percentageInput = document.querySelector("#salt-percent");
  const vegetableField = document.querySelector("#vegetable-field");
  const waterField = document.querySelector("#water-field");
  const errorOutput = document.querySelector("#form-error");
  const resultPlaceholder = document.querySelector("#result-placeholder");
  const resultOutput = document.querySelector("#result-output");
  const resultGrams = document.querySelector("#result-grams");
  const resultSecondary = document.querySelector("#result-secondary");
  const resultFormula = document.querySelector("#result-formula");
  const copyButton = document.querySelector("#copy-result");
  const copyStatus = document.querySelector("#copy-status");
  let latestResult = "";

  const gramsPerUnit = {
    g: 1,
    kg: 1000,
    oz: 28.349523125,
    lb: 453.59237
  };

  const selectedMethod = () => calculator.querySelector('input[name="method"]:checked').value;
  const formatNumber = (value, maximumFractionDigits) =>
    new Intl.NumberFormat("en", { maximumFractionDigits }).format(value);

  const updateMethodFields = () => {
    const method = selectedMethod();
    vegetableField.classList.toggle("is-hidden", method === "water");
    waterField.classList.toggle("is-hidden", method === "dry");
    errorOutput.textContent = "";
    resultOutput.hidden = true;
    resultPlaceholder.hidden = false;
    copyStatus.textContent = "";
  };

  calculator.querySelectorAll('input[name="method"]').forEach((input) => {
    input.addEventListener("change", updateMethodFields);
  });

  calculator.addEventListener("input", () => {
    errorOutput.textContent = "";
    resultOutput.hidden = true;
    resultPlaceholder.hidden = false;
    copyStatus.textContent = "";
  });

  calculator.addEventListener("submit", (event) => {
    event.preventDefault();
    errorOutput.textContent = "";
    copyStatus.textContent = "";

    const method = selectedMethod();
    const percentage = Number(percentageInput.value);
    if (!Number.isFinite(percentage) || percentage <= 0 || percentage > 100) {
      errorOutput.textContent = "Enter a percentage greater than 0 and no more than 100, as specified by your recipe.";
      percentageInput.focus();
      return;
    }

    const ingredientWeight = Number(vegetableInput.value);
    const waterWeight = Number(waterInput.value);
    let ingredientGrams = 0;
    let waterGrams = 0;

    if (method !== "water") {
      if (!Number.isFinite(ingredientWeight) || ingredientWeight <= 0) {
        errorOutput.textContent = "Enter an ingredient weight greater than zero.";
        vegetableInput.focus();
        return;
      }
      ingredientGrams = ingredientWeight * gramsPerUnit[vegetableUnit.value];
    }

    if (method !== "dry") {
      if (!Number.isFinite(waterWeight) || waterWeight <= 0) {
        errorOutput.textContent = "Enter a water weight greater than zero.";
        waterInput.focus();
        return;
      }
      waterGrams = waterWeight * gramsPerUnit[waterUnit.value];
    }

    let basisGrams;
    let basisLabel;
    if (method === "dry") {
      basisGrams = ingredientGrams;
      basisLabel = "ingredient weight";
    } else if (method === "water") {
      basisGrams = waterGrams;
      basisLabel = "water weight";
    } else {
      basisGrams = ingredientGrams + waterGrams;
      basisLabel = "combined ingredient and water weight";
    }

    const saltGrams = basisGrams * percentage / 100;
    if (!Number.isFinite(saltGrams) || saltGrams <= 0) {
      errorOutput.textContent = "That calculation is outside the supported numeric range. Check your inputs and try again.";
      return;
    }

    const methodName = {
      dry: "Dry-salted",
      water: "Water-only brine",
      total: "Total ingredients"
    }[method];
    const saltOunces = saltGrams / gramsPerUnit.oz;
    resultGrams.textContent = formatNumber(saltGrams, 1);
    resultSecondary.textContent = `${formatNumber(saltOunces, 2)} oz · ${methodName}`;
    resultFormula.textContent =
      `${formatNumber(basisGrams, 1)} g ${basisLabel} × ${formatNumber(percentage, 3)}% ÷ 100 = ${formatNumber(saltGrams, 1)} g salt`;
    resultPlaceholder.hidden = true;
    resultOutput.hidden = false;
    latestResult = `${formatNumber(saltGrams, 1)} g salt (${formatNumber(saltOunces, 2)} oz), using ${methodName.toLowerCase()}: ${formatNumber(basisGrams, 1)} g × ${formatNumber(percentage, 3)}% ÷ 100.`;
  });

  copyButton.addEventListener("click", async () => {
    if (!latestResult) {
      copyStatus.textContent = "Calculate a result first.";
      return;
    }
    if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
      copyStatus.textContent = "Copy is unavailable in this browser. Select the result to copy it.";
      return;
    }
    try {
      await navigator.clipboard.writeText(latestResult);
      copyStatus.textContent = "Copied.";
    } catch (error) {
      copyStatus.textContent = "Could not copy automatically. Select the result and copy it manually.";
    }
  });
}

const yearOutput = document.querySelector("#year");
if (yearOutput) {
  yearOutput.textContent = String(new Date().getFullYear());
}
