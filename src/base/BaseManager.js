export class BaseManager {

  constructor(repo) {
    this.repo = repo;
  }

  async getOne(id) {
    const kayit = await this.repo.get_one(id);
    if (!kayit) throw new Error("Kayıt bulunamadı.");
    return kayit;
  }

  async getMany(filters, sortBy, sortOrder, page, limit) {
    return await this.repo.get_many(filters, sortBy, sortOrder, page, limit);
  }

  async create(data) {
    return await this.repo.create(data);
  }

  async patch(id, data) {
    const kayit = await this.repo.patch(id, data);
    if (!kayit) throw new Error("Güncellenecek kayıt bulunamadı.");
    return kayit;
  }

  async softDelete(id, cascadeModels) {
    const kayit = await this.repo.soft_delete(id, cascadeModels);
    if (!kayit) throw new Error("Silinecek kayıt bulunamadı.");
    return kayit;
  }

  async hardDelete(id) {
    return await this.repo.hard_delete(id);
  }
}
