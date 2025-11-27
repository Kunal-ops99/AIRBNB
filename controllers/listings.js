const Listing = require("../models/listing");
const ExpressError = require("../utils/expressError");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new");
};

module.exports.showListing = async (req, res) => {
  const listing = await Listing.findById(req.params.id)
    .populate("owner")
    .populate({
      path: "reviews",
      populate: { path: "author" }
    });

  if (!listing) throw new ExpressError("Listing not found", 404);

  res.render("listings/show", { listing });
};

module.exports.createListing = async (req, res) => {
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  await newListing.save();
  req.flash("success", "New listing created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw new ExpressError("Listing not found", 404);
  res.render("listings/edit", { listing });
};

module.exports.updateListing = async (req, res) => {
  await Listing.findByIdAndUpdate(req.params.id, { ...req.body.listing });
  req.flash("success", "Listing updated!");
  res.redirect(`/listings/${req.params.id}`);
};

module.exports.deleteListing = async (req, res) => {
  await Listing.findByIdAndDelete(req.params.id);
  req.flash("Listing deleted!");
  res.redirect("/listings");
};
