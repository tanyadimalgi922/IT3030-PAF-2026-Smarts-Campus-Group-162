package Backend.resource;

import jakarta.validation.constraints.NotBlank;

public class AvailabilityWindow {

    @NotBlank
    private String date;

    @NotBlank
    private String startTime;

    @NotBlank
    private String endTime;

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
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
