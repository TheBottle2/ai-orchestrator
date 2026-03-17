import mongoose from "mongoose";

export class BaseRepo {

  constructor(model) {
    this.model = model;
  }

  async get_one(id) {
    return await this.model.findOne({ _id: id, silindi_mi: false });
  }

  async get_many(
    filters   = {},
    sortBy    = "olusturulma_tarihi",
    sortOrder = -1,
    page      = 1,
    limit     = 10
  ) {
    const query = { ...filters, silindi_mi: false };
    const skip  = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.model.find(query).sort({ [sortBy]: sortOrder }).skip(skip).limit(limit),
      this.model.countDocuments(query),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async create(data) {
    return await this.model.create(data);
  }

  async patch(id, data) {
    return await this.model.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
  }

  async update(id, data) {
    return await this.model.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true }
    );
  }

  async soft_delete(id, cascadeModels = []) {
    const result = await this.model.findByIdAndUpdate(
      id,
      { $set: { silindi_mi: true, aktif_mi: false } },
      { new: true }
    );

    for (const { model: childModel, foreignKey } of cascadeModels) {
      await childModel.updateMany(
        { [foreignKey]: id },
        { $set: { silindi_mi: true, aktif_mi: false } }
      );
    }

    return result;
  }

  async hard_delete(id) {
    return await this.model.findByIdAndDelete(id);
  }
}
