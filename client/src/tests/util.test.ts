import ConvertShiftTimeTo12HrFormat from "../utils/12HourFormat";
import Convert24To12HourFormat from "../utils/24HourTo12HourFormat";
import BigNumberFormatter from "../utils/BigNumberFormatter";
import CalculateSpeed from "../utils/CalculateSpeedByCoordinates";
import DateDifference from "../utils/DateDifference";
import formatDateString from "../utils/DateFormatter";

describe("Utils Tests", () => {

    // ConvertShiftTimeTo12HrFormat TESTS
    test("ConvertShiftTimeTo12HrFormat", () => {
        expect(ConvertShiftTimeTo12HrFormat("20:30")).toBe("8:30 PM")
    });
    it("ConvertShiftTimeTo12HrFormat", () => {
        expect(ConvertShiftTimeTo12HrFormat("2:00")).toBe("2:00 AM")
    });

    // Convert24To12HourFormat TESTS
    test("Convert24To12HourFormat AM", () => {
        expect(Convert24To12HourFormat("10:30-18:00")).toBe("10:30 AM - 06:00 PM")
    })
    test("Convert24To12HourFormat PM", () => {
        expect(Convert24To12HourFormat("14:00-20:30")).toBe("02:00 PM - 08:30 PM")
    })

    // BigNumberFormatter TESTS
    test("BigNumberFormatter", () => {
        expect(BigNumberFormatter(1000)).toBe("1.0k")
    })

    // CalculateSpeed TESTS
    test("CalculateSpeedByCoordinates", () => {
        expect(
            CalculateSpeed([34.01553773486447, 74.79906572121095], [34.01579864508473, 74.79900205932535]))
            .toBeCloseTo(106.55746690677094)
    })

    // DateDifference TESTS
    test("DateDifference", () => {
        const date = new Date("2024-11-12T00:00:00.000Z")
        expect(DateDifference(date)).toBe("After 6 days")
    })

    // formatDateString TESTS
    test("formatDateString Today", () => {
        expect(formatDateString("2024-11-06")).toBe("Today")
    })
    test("formatDateString After Days", () => {
        expect(formatDateString("2024-11-12", true)).toBe("Tue, 12th of Nov - 2024")
    })

})