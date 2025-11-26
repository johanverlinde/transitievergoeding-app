document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('calculator-form');
    const resultContainer = document.getElementById('result-container');
    const resultAmount = document.getElementById('result-amount');
    const detailYears = document.getElementById('detail-years');
    const detailMonths = document.getElementById('detail-months');
    const detailDays = document.getElementById('detail-days');
    const detailSalary = document.getElementById('detail-salary');
    const warningMessage = document.getElementById('warning-message');

    // Constants for 2024
    const MAX_TRANSITION_PAYMENT_2024 = 94000;
    const AOW_AGE_YEARS = 67; // Simplified for 2024

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        calculate();
    });

    function calculate() {
        // 1. Get Input Values
        const salaryInput = parseFloat(document.getElementById('salary').value);
        const startDate = new Date(document.getElementById('startDate').value);
        const endDate = new Date(document.getElementById('endDate').value);

        // Validation
        if (isNaN(salaryInput) || !startDate.getTime() || !endDate.getTime()) {
            alert("Vul alle verplichte velden in.");
            return;
        }

        if (endDate <= startDate) {
            alert("Datum uit dienst moet na datum in dienst liggen.");
            return;
        }

        // 2. Calculate Base Monthly Salary (Directly from input)
        const monthlySalary = salaryInput;

        // 3. Calculate Duration (Years, Months, Days)
        // We use a precise method: count full years, then full months, then days.
        let years = endDate.getFullYear() - startDate.getFullYear();
        let months = endDate.getMonth() - startDate.getMonth();
        let days = endDate.getDate() - startDate.getDate();

        // Adjust for negative days (borrow from previous month)
        if (days < 0) {
            months--;
            // Get days in the previous month relative to endDate
            const previousMonthDate = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
            days += previousMonthDate.getDate();
        }

        // Adjust for negative months (borrow from year)
        if (months < 0) {
            years--;
            months += 12;
        }

        // 4. Calculate Transitievergoeding
        // Formula: (1/3 * MonthlySalary * Years) + (1/3 * MonthlySalary * Months / 12) + (1/3 * MonthlySalary * Days / 365)

        const partYears = (1 / 3) * monthlySalary * years;
        const partMonths = (monthlySalary / 36) * months; // 1/3 * 1/12 = 1/36
        const partDays = (monthlySalary / 1095) * days;   // 1/3 * 1/365 = 1/1095 approx. WAB uses this.

        let totalTransitionPayment = partYears + partMonths + partDays;

        // 5. Apply Cap
        // Max is €94,000 OR 1 annual salary if annual salary > €94,000.
        const annualSalary = monthlySalary * 12; // Approximation of annual salary for cap check
        const maxCap = Math.max(MAX_TRANSITION_PAYMENT_2024, annualSalary);

        let cappedPayment = Math.min(totalTransitionPayment, maxCap);

        // 6. Update UI
        resultAmount.textContent = formatCurrency(cappedPayment);
        detailYears.textContent = years;
        detailMonths.textContent = months;
        detailDays.textContent = days;
        detailSalary.textContent = formatCurrency(monthlySalary);

        warningMessage.classList.add('hidden');
        resultContainer.classList.remove('hidden');
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(amount);
    }

    // Test function exposed for console
    window.runTests = function () {
        console.log("Running Tests...");

        // Test Case 1: 3 years, 3000 salary
        // Expected: 3000
        const t1_salary = 3000;
        const t1_years = 3;
        const t1_res = (1 / 3) * t1_salary * t1_years;
        console.log(`Test 1 (3y, 3000): Expected 3000, Got ${t1_res}`);

        // Test Case 2: 1 month, 3600 salary
        // Expected: 100
        const t2_salary = 3600;
        const t2_months = 1;
        const t2_res = (t2_salary / 36) * t2_months;
        console.log(`Test 2 (1m, 3600): Expected 100, Got ${t2_res}`);

        return "Tests Completed";
    }
});
