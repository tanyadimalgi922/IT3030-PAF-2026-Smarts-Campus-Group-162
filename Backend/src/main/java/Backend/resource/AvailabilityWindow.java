package Backend.resource;

import jakarta.validation.constraints.NotBlank;

public class AvailabilityWindow {

    @NotBlank
    private String startDate;

    @NotBlank
    private String endDate;

    @NotBlank
    private String startTime;

    @NotBlank
    private String endTime;

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }
}
