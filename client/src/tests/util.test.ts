import ConvertShiftTimeTo12HrFormat from "../utils/12HourFormat";

describe("Utils Tests", () => {
    test("ConvertShiftTimeTo12HrFormat", () => {
        expect(ConvertShiftTimeTo12HrFormat("20:30")).toBe("8:30 PM")
    });
    it("ConvertShiftTimeTo12HrFormat", () => {
        expect(ConvertShiftTimeTo12HrFormat("2:00")).toBe("2:00 AM")
    });
    test("ConvertShiftTimeTo12HrFormat", () => {
        expect(ConvertShiftTimeTo12HrFormat("20:30", "drop")).toBe("8:30 PM")
    })
})