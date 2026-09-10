import type { Model, UpdateQuery, QueryOptions, ProjectionType, Types, HydratedDocument } from "mongoose";

export interface QueryBaseParams<T> {
  model: Model<T>;
  select?: ProjectionType<T> | string;
  options?: QueryOptions<T> & {
    populate?: any;
    lean?: boolean;
    limit?: number;
    skip?: number;
  };
}

export interface FindOneParams<T> extends QueryBaseParams<T> {
  filter?: Record<string, any>;
}

export interface FindByIdParams<T> extends QueryBaseParams<T> {
  id: string | Types.ObjectId;
}

export interface FindParams<T> extends QueryBaseParams<T> {
  filter?: Record<string, any>;
}

export interface CreateParams<T> {
  model: Model<T>;
  data: Record<string, any>;
  options?: Record<string, any>;
}

export interface CreateOneParams<T> {
  model: Model<T>;
  data: Record<string, any>;
  options?: Record<string, any>;
}

export interface UpdateOneParams<T> {
  model: Model<T>;
  filter: Record<string, any>;
  update: UpdateQuery<T> | Record<string, any>;
  options?: Record<string, any>;
}

export interface FindOneAndUpdateParams<T> {
  model: Model<T>;
  filter: Record<string, any>;
  update: UpdateQuery<T> | Record<string, any>;
  options?: Record<string, any>;
}

export interface FindByIdAndUpdateParams<T> {
  model: Model<T>;
  id: string | Types.ObjectId;
  update: UpdateQuery<T> | Record<string, any>;
  options?: Record<string, any>;
}

export interface DeleteParams<T> {
  model: Model<T>;
  filter: Record<string, any>;
}

export const findOne = async <T>({
  model,
  filter = {},
  select = "",
  options = {},
}: FindOneParams<T>): Promise<HydratedDocument<T> | null> => {
  const doc = model.findOne(filter);

  if (select) doc.select(select);
  if (options.populate) doc.populate(options.populate);
  if (options.lean) doc.lean();

  return (await doc.exec()) as HydratedDocument<T> | null;
};

export const findById = async <T>({
  model,
  id,
  select = "",
  options = {},
}: FindByIdParams<T>): Promise<HydratedDocument<T> | null> => {
  const doc = model.findById(id);

  if (select) doc.select(select);
  if (options.populate) doc.populate(options.populate);
  if (options.lean) doc.lean();

  return (await doc.exec()) as HydratedDocument<T> | null;
};

export const find = async <T>({
  model,
  filter = {},
  select = "",
  options = {},
}: FindParams<T>): Promise<HydratedDocument<T>[]> => {
  const doc = model.find(filter);

  if (select) doc.select(select);
  if (options.populate) doc.populate(options.populate);
  if (options.lean) doc.lean();
  if (options.limit) doc.limit(options.limit);
  if (options.skip) doc.skip(options.skip);

  return (await doc.exec()) as HydratedDocument<T>[];
};

export const create = async <T>({
  model,
  data,
  options = { validateBeforeSave: true },
}: CreateParams<T>): Promise<HydratedDocument<T>> => {
  const doc = new model(data);
  return (await doc.save(options)) as unknown as HydratedDocument<T>;
};

export const createOne = async <T>({
  model,
  data,
  options = { validateBeforeSave: true },
}: CreateOneParams<T>): Promise<HydratedDocument<T>> => {
  const doc = new model(data);
  return (await doc.save(options)) as unknown as HydratedDocument<T>;
};

export const insertMany = async <T>({
  model,
  data,
}: {
  model: Model<T>;
  data: Record<string, any>[];
}): Promise<HydratedDocument<T>[]> => {
  return (await model.insertMany(data)) as unknown as HydratedDocument<T>[];
};

export const updateOne = async <T>({ model, filter, update, options = {} }: UpdateOneParams<T>) => {
  return await model.updateOne(
    filter,
    {
      ...update,
      $inc: { __v: 1 },
    },
    options,
  );
};

export const findOneAndUpdate = async <T>({
  model,
  filter,
  update,
  options = {},
}: FindOneAndUpdateParams<T>): Promise<HydratedDocument<T> | null> => {
  return (await model.findOneAndUpdate(
    filter,
    {
      ...update,
      $inc: { __v: 1 },
    },
    {
      ...options,
      new: true,
      runValidators: true,
    },
  )) as HydratedDocument<T> | null;
};

export const findByIdAndUpdate = async <T>({
  model,
  id,
  update,
  options = {},
}: FindByIdAndUpdateParams<T>): Promise<HydratedDocument<T> | null> => {
  return (await model.findByIdAndUpdate(
    id,
    {
      ...update,
      $inc: { __v: 1 },
    },
    {
      ...options,
      new: true,
      runValidators: true,
    },
  )) as HydratedDocument<T> | null;
};

export const deleteOne = async <T>({ model, filter }: DeleteParams<T>) => {
  return await model.deleteOne(filter);
};

export const deleteMany = async <T>({ model, filter }: DeleteParams<T>) => {
  return await model.deleteMany(filter);
};

export const findOneAndDelete = async <T>({ model, filter }: DeleteParams<T>): Promise<HydratedDocument<T> | null> => {
  return (await model.findOneAndDelete(filter)) as HydratedDocument<T> | null;
};
