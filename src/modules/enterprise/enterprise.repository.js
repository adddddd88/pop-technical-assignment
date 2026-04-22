const { EnterpriseModel } = require('./enterprise.schema');

class EnterpriseRepository {

  async findActiveById(id) {
    return EnterpriseModel.findOne({ _id: id, isActive: true }).exec();
  }

  async create(data) {
    return EnterpriseModel.create(data);
  }
}

module.exports = { EnterpriseRepository };
