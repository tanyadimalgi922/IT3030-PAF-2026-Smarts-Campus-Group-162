import { useState } from "react";
import { createResourceReview } from "../../api/resourceApi";
import StudentBookingPanel from "../bookings/StudentBookingPanel";

function ResourceCard({
  adminMode = false,
  bookingMode = false,
  onBooked,
  onDelete,
  onEdit,
  onReviewSubmitted,
  resource,
  reviewEligibleBooking,
  user,
  userHasReviewed = false,
}) {
  const amenities = resource.amenities || [];
  const [bookingOpen, setBookingOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const canReview = bookingMode && Boolean(reviewEligibleBooking);

  const submitReview = async (event) => {
    event.preventDefault();
    setReviewSubmitting(true);
    setReviewError("");

    try {
      await createResourceReview(resource.id, {
        bookingId: reviewEligibleBooking.id,
        userId: user.id,
        userName: user.fullName,
        userEmail: user.email,
        rating,
        feedback,
      });
      setFeedback("");
      setReviewOpen(false);
      onReviewSubmitted?.();
    } catch (requestError) {
      setReviewError(requestError.message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <article className="overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-glow">
      <div className="aspect-[16/8] bg-campus-cloud">
        {resource.imageDataUrl ? (
          <img
            alt={resource.name}
            className="h-full w-full object-cover"
            src={resource.imageDataUrl}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs font-bold text-campus-blue">
            No image
          </div>
        )}
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-black leading-tight text-campus-ink">{resource.name}</h3>
            <p className="mt-0.5 text-xs font-semibold text-slate-600">{formatType(resource.type)}</p>
          </div>
          <span
            className={`rounded-md px-2 py-1 text-[11px] font-black ${
              resource.status === "ACTIVE"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {formatStatus(resource.status)}
          </span>
        </div>

        <div className="mt-3 grid gap-1.5 text-xs text-slate-700">
          <p>
            <span className="font-bold text-campus-navy">Capacity:</span> {resource.capacity}
          </p>
          <p>
            <span className="font-bold text-campus-navy">Location:</span> {resource.location}
          </p>
          <p>
            <span className="font-bold text-campus-navy">Building:</span>{" "}
            {resource.building || "Not mapped"}
          </p>
          <p>
            <span className="font-bold text-campus-navy">Floor / Room:</span>{" "}
            {[resource.floor, resource.roomNumber].filter(Boolean).join(" / ") || "Not mapped"}
          </p>
        </div>

        <div className="mt-3">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">
            Amenities
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {amenities.length > 0 ? (
              amenities.map((amenity) => (
                <span
                  className="rounded-full border border-blue-100 bg-[#f8fbff] px-2.5 py-0.5 text-[11px] font-bold text-campus-blue"
                  key={amenity}
                >
                  {amenity}
                </span>
              ))
            ) : (
              <span className="text-xs font-semibold text-slate-500">No amenities listed</span>
            )}
          </div>
        </div>

        <div className="mt-3 rounded-md bg-campus-pale p-2.5">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">
            Availability
          </p>
          <div className="mt-1.5 grid gap-1 text-xs font-semibold leading-5 text-campus-navy">
            {(resource.availabilityWindows || []).length > 0 ? (
              resource.availabilityWindows.map((window, index) => (
                <p key={`${window.date}-${window.startTime}-${index}`}>
                  {formatWindow(window)}
                </p>
              ))
            ) : (
              <p>Not provided</p>
            )}
          </div>
        </div>

        <div className="mt-3 rounded-md border border-amber-100 bg-amber-50/40 p-2.5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">
              Reviews
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-campus-navy">
              <span>{renderStars(resource.averageRating || 0)}</span>
              <span>{resource.reviewCount > 0 ? `${resource.averageRating}/5` : "No rating"}</span>
            </div>
          </div>
          <p className="mt-1 text-xs font-semibold text-slate-600">
            {resource.reviewCount > 0
              ? `${resource.reviewCount} review${resource.reviewCount > 1 ? "s" : ""}`
              : "No student feedback yet"}
          </p>
          {(resource.recentReviews || []).length > 0 && (
            <div className="mt-2 grid gap-2">
              {resource.recentReviews.map((review) => (
                <div className="rounded-md border border-amber-100 bg-white px-2.5 py-2" key={review.id}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-black text-campus-navy">{review.userName}</p>
                    <p className="text-[11px] font-bold text-amber-600">{renderStars(review.rating)}</p>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-600">{review.feedback}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {adminMode && (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <button
              className="min-h-10 rounded-md bg-campus-navy px-3 text-xs font-black text-white transition hover:bg-campus-blue"
              onClick={onEdit}
              type="button"
            >
              Update
            </button>
            <button
              className="min-h-10 rounded-md border border-red-200 bg-red-50 px-3 text-xs font-black text-red-700 transition hover:bg-red-100"
              onClick={onDelete}
              type="button"
            >
              Delete
            </button>
          </div>
        )}

        {bookingMode && resource.status === "ACTIVE" && (
          <>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <button
                className="primary-action min-h-10 w-full rounded-md px-3 text-xs font-black text-white transition hover:scale-[1.01]"
                onClick={() => setBookingOpen((current) => !current)}
                type="button"
              >
                {bookingOpen ? "Hide Booking" : "Book Now"}
              </button>
              <button
                className="min-h-10 rounded-md border border-amber-200 bg-white px-3 text-xs font-black text-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!canReview}
                onClick={() => setReviewOpen((current) => !current)}
                type="button"
              >
                {canReview ? "Add Review" : userHasReviewed ? "Reviewed" : "Add Review"}
              </button>
            </div>
            {bookingOpen && (
              <StudentBookingPanel
                onBooked={() => {
                  onBooked?.();
                  setBookingOpen(false);
                }}
                resource={resource}
                user={user}
              />
            )}
            {reviewOpen && canReview && (
              <form className="mt-3 rounded-lg border border-amber-100 bg-amber-50/40 p-3" onSubmit={submitReview}>
                <p className="text-[11px] font-black uppercase tracking-[0.12em] text-amber-700">
                  Rate This Resource
                </p>
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      className={`text-lg transition ${star <= rating ? "text-amber-500" : "text-slate-300"}`}
                      key={star}
                      onClick={() => setRating(star)}
                      type="button"
                    >
                      {"\u2605"}
                    </button>
                  ))}
                </div>
                <textarea
                  className="field-input mt-2 min-h-24 text-xs"
                  onChange={(event) => setFeedback(event.target.value)}
                  placeholder="Share your feedback about this resource"
                  required
                  value={feedback}
                />
                {reviewError && <p className="mt-2 text-xs font-bold text-red-700">{reviewError}</p>}
                <button
                  className="mt-2 min-h-10 rounded-md bg-amber-500 px-3 text-xs font-black text-white disabled:opacity-50"
                  disabled={reviewSubmitting}
                  type="submit"
                >
                  {reviewSubmitting ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </article>
  );
}

function formatType(type) {
  return (type || "").replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatStatus(status) {
  return (status || "").replaceAll("_", " ");
}

function formatWindow(window) {
  const startDate = window.startDate || window.date || "Start date";
  const endDate = window.endDate || window.date || "End date";
  return `${startDate} to ${endDate} / ${window.startTime} - ${window.endTime}`;
}

function renderStars(rating) {
  const rounded = Math.round(Number(rating) || 0);
  return "\u2605\u2605\u2605\u2605\u2605".slice(0, rounded) + "\u2606\u2606\u2606\u2606\u2606".slice(0, 5 - rounded);
}

export default ResourceCard;
