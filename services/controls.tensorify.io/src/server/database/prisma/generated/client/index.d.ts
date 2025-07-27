
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model AdminAccount
 * 
 */
export type AdminAccount = $Result.DefaultSelection<Prisma.$AdminAccountPayload>
/**
 * Model BlogPost
 * 
 */
export type BlogPost = $Result.DefaultSelection<Prisma.$BlogPostPayload>
/**
 * Model BlogTag
 * 
 */
export type BlogTag = $Result.DefaultSelection<Prisma.$BlogTagPayload>
/**
 * Model BlogSeo
 * 
 */
export type BlogSeo = $Result.DefaultSelection<Prisma.$BlogSeoPayload>
/**
 * Model OnboardingTagVersion
 * 
 */
export type OnboardingTagVersion = $Result.DefaultSelection<Prisma.$OnboardingTagVersionPayload>
/**
 * Model OnboardingQuestion
 * 
 */
export type OnboardingQuestion = $Result.DefaultSelection<Prisma.$OnboardingQuestionPayload>
/**
 * Model OnboardingOption
 * 
 */
export type OnboardingOption = $Result.DefaultSelection<Prisma.$OnboardingOptionPayload>
/**
 * Model OnboardingResponse
 * 
 */
export type OnboardingResponse = $Result.DefaultSelection<Prisma.$OnboardingResponsePayload>
/**
 * Model OnboardingAnswer
 * 
 */
export type OnboardingAnswer = $Result.DefaultSelection<Prisma.$OnboardingAnswerPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const BlogPostType: {
  ANNOUNCEMENT: 'ANNOUNCEMENT',
  ARTICLE: 'ARTICLE',
  CUSTOMER_STORY: 'CUSTOMER_STORY',
  COMPANY_NEWS: 'COMPANY_NEWS',
  ENGINEERING_BLOG: 'ENGINEERING_BLOG',
  THOUGHT_LEADERSHIP: 'THOUGHT_LEADERSHIP',
  FEATURE_UPDATE: 'FEATURE_UPDATE',
  EVENT: 'EVENT',
  GUIDE: 'GUIDE',
  RESEARCH: 'RESEARCH'
};

export type BlogPostType = (typeof BlogPostType)[keyof typeof BlogPostType]


export const BlogPostStatus: {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED'
};

export type BlogPostStatus = (typeof BlogPostStatus)[keyof typeof BlogPostStatus]


export const QuestionType: {
  single_choice: 'single_choice',
  multi_choice: 'multi_choice'
};

export type QuestionType = (typeof QuestionType)[keyof typeof QuestionType]


export const OrgSizeBracket: {
  LT_20: 'LT_20',
  FROM_20_TO_99: 'FROM_20_TO_99',
  FROM_100_TO_499: 'FROM_100_TO_499',
  FROM_500_TO_999: 'FROM_500_TO_999',
  GTE_1000: 'GTE_1000'
};

export type OrgSizeBracket = (typeof OrgSizeBracket)[keyof typeof OrgSizeBracket]


export const IntentTag: {
  WILL_NOT_PAY: 'WILL_NOT_PAY',
  WILL_PAY_HOBBY: 'WILL_PAY_HOBBY',
  WILL_PAY_TEAM: 'WILL_PAY_TEAM',
  ENTERPRISE_POTENTIAL: 'ENTERPRISE_POTENTIAL'
};

export type IntentTag = (typeof IntentTag)[keyof typeof IntentTag]


export const TagStatus: {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED'
};

export type TagStatus = (typeof TagStatus)[keyof typeof TagStatus]

}

export type BlogPostType = $Enums.BlogPostType

export const BlogPostType: typeof $Enums.BlogPostType

export type BlogPostStatus = $Enums.BlogPostStatus

export const BlogPostStatus: typeof $Enums.BlogPostStatus

export type QuestionType = $Enums.QuestionType

export const QuestionType: typeof $Enums.QuestionType

export type OrgSizeBracket = $Enums.OrgSizeBracket

export const OrgSizeBracket: typeof $Enums.OrgSizeBracket

export type IntentTag = $Enums.IntentTag

export const IntentTag: typeof $Enums.IntentTag

export type TagStatus = $Enums.TagStatus

export const TagStatus: typeof $Enums.TagStatus

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more AdminAccounts
 * const adminAccounts = await prisma.adminAccount.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more AdminAccounts
   * const adminAccounts = await prisma.adminAccount.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.adminAccount`: Exposes CRUD operations for the **AdminAccount** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AdminAccounts
    * const adminAccounts = await prisma.adminAccount.findMany()
    * ```
    */
  get adminAccount(): Prisma.AdminAccountDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.blogPost`: Exposes CRUD operations for the **BlogPost** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more BlogPosts
    * const blogPosts = await prisma.blogPost.findMany()
    * ```
    */
  get blogPost(): Prisma.BlogPostDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.blogTag`: Exposes CRUD operations for the **BlogTag** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more BlogTags
    * const blogTags = await prisma.blogTag.findMany()
    * ```
    */
  get blogTag(): Prisma.BlogTagDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.blogSeo`: Exposes CRUD operations for the **BlogSeo** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more BlogSeos
    * const blogSeos = await prisma.blogSeo.findMany()
    * ```
    */
  get blogSeo(): Prisma.BlogSeoDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.onboardingTagVersion`: Exposes CRUD operations for the **OnboardingTagVersion** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OnboardingTagVersions
    * const onboardingTagVersions = await prisma.onboardingTagVersion.findMany()
    * ```
    */
  get onboardingTagVersion(): Prisma.OnboardingTagVersionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.onboardingQuestion`: Exposes CRUD operations for the **OnboardingQuestion** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OnboardingQuestions
    * const onboardingQuestions = await prisma.onboardingQuestion.findMany()
    * ```
    */
  get onboardingQuestion(): Prisma.OnboardingQuestionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.onboardingOption`: Exposes CRUD operations for the **OnboardingOption** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OnboardingOptions
    * const onboardingOptions = await prisma.onboardingOption.findMany()
    * ```
    */
  get onboardingOption(): Prisma.OnboardingOptionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.onboardingResponse`: Exposes CRUD operations for the **OnboardingResponse** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OnboardingResponses
    * const onboardingResponses = await prisma.onboardingResponse.findMany()
    * ```
    */
  get onboardingResponse(): Prisma.OnboardingResponseDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.onboardingAnswer`: Exposes CRUD operations for the **OnboardingAnswer** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OnboardingAnswers
    * const onboardingAnswers = await prisma.onboardingAnswer.findMany()
    * ```
    */
  get onboardingAnswer(): Prisma.OnboardingAnswerDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.12.0
   * Query Engine version: 8047c96bbd92db98a2abc7c9323ce77c02c89dbc
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    AdminAccount: 'AdminAccount',
    BlogPost: 'BlogPost',
    BlogTag: 'BlogTag',
    BlogSeo: 'BlogSeo',
    OnboardingTagVersion: 'OnboardingTagVersion',
    OnboardingQuestion: 'OnboardingQuestion',
    OnboardingOption: 'OnboardingOption',
    OnboardingResponse: 'OnboardingResponse',
    OnboardingAnswer: 'OnboardingAnswer'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "adminAccount" | "blogPost" | "blogTag" | "blogSeo" | "onboardingTagVersion" | "onboardingQuestion" | "onboardingOption" | "onboardingResponse" | "onboardingAnswer"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      AdminAccount: {
        payload: Prisma.$AdminAccountPayload<ExtArgs>
        fields: Prisma.AdminAccountFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AdminAccountFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminAccountPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AdminAccountFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminAccountPayload>
          }
          findFirst: {
            args: Prisma.AdminAccountFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminAccountPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AdminAccountFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminAccountPayload>
          }
          findMany: {
            args: Prisma.AdminAccountFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminAccountPayload>[]
          }
          create: {
            args: Prisma.AdminAccountCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminAccountPayload>
          }
          createMany: {
            args: Prisma.AdminAccountCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AdminAccountCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminAccountPayload>[]
          }
          delete: {
            args: Prisma.AdminAccountDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminAccountPayload>
          }
          update: {
            args: Prisma.AdminAccountUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminAccountPayload>
          }
          deleteMany: {
            args: Prisma.AdminAccountDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AdminAccountUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AdminAccountUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminAccountPayload>[]
          }
          upsert: {
            args: Prisma.AdminAccountUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminAccountPayload>
          }
          aggregate: {
            args: Prisma.AdminAccountAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAdminAccount>
          }
          groupBy: {
            args: Prisma.AdminAccountGroupByArgs<ExtArgs>
            result: $Utils.Optional<AdminAccountGroupByOutputType>[]
          }
          count: {
            args: Prisma.AdminAccountCountArgs<ExtArgs>
            result: $Utils.Optional<AdminAccountCountAggregateOutputType> | number
          }
        }
      }
      BlogPost: {
        payload: Prisma.$BlogPostPayload<ExtArgs>
        fields: Prisma.BlogPostFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BlogPostFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogPostPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BlogPostFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogPostPayload>
          }
          findFirst: {
            args: Prisma.BlogPostFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogPostPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BlogPostFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogPostPayload>
          }
          findMany: {
            args: Prisma.BlogPostFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogPostPayload>[]
          }
          create: {
            args: Prisma.BlogPostCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogPostPayload>
          }
          createMany: {
            args: Prisma.BlogPostCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.BlogPostCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogPostPayload>[]
          }
          delete: {
            args: Prisma.BlogPostDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogPostPayload>
          }
          update: {
            args: Prisma.BlogPostUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogPostPayload>
          }
          deleteMany: {
            args: Prisma.BlogPostDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BlogPostUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.BlogPostUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogPostPayload>[]
          }
          upsert: {
            args: Prisma.BlogPostUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogPostPayload>
          }
          aggregate: {
            args: Prisma.BlogPostAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBlogPost>
          }
          groupBy: {
            args: Prisma.BlogPostGroupByArgs<ExtArgs>
            result: $Utils.Optional<BlogPostGroupByOutputType>[]
          }
          count: {
            args: Prisma.BlogPostCountArgs<ExtArgs>
            result: $Utils.Optional<BlogPostCountAggregateOutputType> | number
          }
        }
      }
      BlogTag: {
        payload: Prisma.$BlogTagPayload<ExtArgs>
        fields: Prisma.BlogTagFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BlogTagFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogTagPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BlogTagFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogTagPayload>
          }
          findFirst: {
            args: Prisma.BlogTagFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogTagPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BlogTagFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogTagPayload>
          }
          findMany: {
            args: Prisma.BlogTagFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogTagPayload>[]
          }
          create: {
            args: Prisma.BlogTagCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogTagPayload>
          }
          createMany: {
            args: Prisma.BlogTagCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.BlogTagCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogTagPayload>[]
          }
          delete: {
            args: Prisma.BlogTagDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogTagPayload>
          }
          update: {
            args: Prisma.BlogTagUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogTagPayload>
          }
          deleteMany: {
            args: Prisma.BlogTagDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BlogTagUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.BlogTagUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogTagPayload>[]
          }
          upsert: {
            args: Prisma.BlogTagUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogTagPayload>
          }
          aggregate: {
            args: Prisma.BlogTagAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBlogTag>
          }
          groupBy: {
            args: Prisma.BlogTagGroupByArgs<ExtArgs>
            result: $Utils.Optional<BlogTagGroupByOutputType>[]
          }
          count: {
            args: Prisma.BlogTagCountArgs<ExtArgs>
            result: $Utils.Optional<BlogTagCountAggregateOutputType> | number
          }
        }
      }
      BlogSeo: {
        payload: Prisma.$BlogSeoPayload<ExtArgs>
        fields: Prisma.BlogSeoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BlogSeoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogSeoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BlogSeoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogSeoPayload>
          }
          findFirst: {
            args: Prisma.BlogSeoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogSeoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BlogSeoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogSeoPayload>
          }
          findMany: {
            args: Prisma.BlogSeoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogSeoPayload>[]
          }
          create: {
            args: Prisma.BlogSeoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogSeoPayload>
          }
          createMany: {
            args: Prisma.BlogSeoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.BlogSeoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogSeoPayload>[]
          }
          delete: {
            args: Prisma.BlogSeoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogSeoPayload>
          }
          update: {
            args: Prisma.BlogSeoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogSeoPayload>
          }
          deleteMany: {
            args: Prisma.BlogSeoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BlogSeoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.BlogSeoUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogSeoPayload>[]
          }
          upsert: {
            args: Prisma.BlogSeoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BlogSeoPayload>
          }
          aggregate: {
            args: Prisma.BlogSeoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBlogSeo>
          }
          groupBy: {
            args: Prisma.BlogSeoGroupByArgs<ExtArgs>
            result: $Utils.Optional<BlogSeoGroupByOutputType>[]
          }
          count: {
            args: Prisma.BlogSeoCountArgs<ExtArgs>
            result: $Utils.Optional<BlogSeoCountAggregateOutputType> | number
          }
        }
      }
      OnboardingTagVersion: {
        payload: Prisma.$OnboardingTagVersionPayload<ExtArgs>
        fields: Prisma.OnboardingTagVersionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OnboardingTagVersionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingTagVersionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OnboardingTagVersionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingTagVersionPayload>
          }
          findFirst: {
            args: Prisma.OnboardingTagVersionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingTagVersionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OnboardingTagVersionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingTagVersionPayload>
          }
          findMany: {
            args: Prisma.OnboardingTagVersionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingTagVersionPayload>[]
          }
          create: {
            args: Prisma.OnboardingTagVersionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingTagVersionPayload>
          }
          createMany: {
            args: Prisma.OnboardingTagVersionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OnboardingTagVersionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingTagVersionPayload>[]
          }
          delete: {
            args: Prisma.OnboardingTagVersionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingTagVersionPayload>
          }
          update: {
            args: Prisma.OnboardingTagVersionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingTagVersionPayload>
          }
          deleteMany: {
            args: Prisma.OnboardingTagVersionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OnboardingTagVersionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OnboardingTagVersionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingTagVersionPayload>[]
          }
          upsert: {
            args: Prisma.OnboardingTagVersionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingTagVersionPayload>
          }
          aggregate: {
            args: Prisma.OnboardingTagVersionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOnboardingTagVersion>
          }
          groupBy: {
            args: Prisma.OnboardingTagVersionGroupByArgs<ExtArgs>
            result: $Utils.Optional<OnboardingTagVersionGroupByOutputType>[]
          }
          count: {
            args: Prisma.OnboardingTagVersionCountArgs<ExtArgs>
            result: $Utils.Optional<OnboardingTagVersionCountAggregateOutputType> | number
          }
        }
      }
      OnboardingQuestion: {
        payload: Prisma.$OnboardingQuestionPayload<ExtArgs>
        fields: Prisma.OnboardingQuestionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OnboardingQuestionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingQuestionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OnboardingQuestionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingQuestionPayload>
          }
          findFirst: {
            args: Prisma.OnboardingQuestionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingQuestionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OnboardingQuestionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingQuestionPayload>
          }
          findMany: {
            args: Prisma.OnboardingQuestionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingQuestionPayload>[]
          }
          create: {
            args: Prisma.OnboardingQuestionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingQuestionPayload>
          }
          createMany: {
            args: Prisma.OnboardingQuestionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OnboardingQuestionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingQuestionPayload>[]
          }
          delete: {
            args: Prisma.OnboardingQuestionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingQuestionPayload>
          }
          update: {
            args: Prisma.OnboardingQuestionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingQuestionPayload>
          }
          deleteMany: {
            args: Prisma.OnboardingQuestionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OnboardingQuestionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OnboardingQuestionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingQuestionPayload>[]
          }
          upsert: {
            args: Prisma.OnboardingQuestionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingQuestionPayload>
          }
          aggregate: {
            args: Prisma.OnboardingQuestionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOnboardingQuestion>
          }
          groupBy: {
            args: Prisma.OnboardingQuestionGroupByArgs<ExtArgs>
            result: $Utils.Optional<OnboardingQuestionGroupByOutputType>[]
          }
          count: {
            args: Prisma.OnboardingQuestionCountArgs<ExtArgs>
            result: $Utils.Optional<OnboardingQuestionCountAggregateOutputType> | number
          }
        }
      }
      OnboardingOption: {
        payload: Prisma.$OnboardingOptionPayload<ExtArgs>
        fields: Prisma.OnboardingOptionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OnboardingOptionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingOptionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OnboardingOptionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingOptionPayload>
          }
          findFirst: {
            args: Prisma.OnboardingOptionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingOptionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OnboardingOptionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingOptionPayload>
          }
          findMany: {
            args: Prisma.OnboardingOptionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingOptionPayload>[]
          }
          create: {
            args: Prisma.OnboardingOptionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingOptionPayload>
          }
          createMany: {
            args: Prisma.OnboardingOptionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OnboardingOptionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingOptionPayload>[]
          }
          delete: {
            args: Prisma.OnboardingOptionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingOptionPayload>
          }
          update: {
            args: Prisma.OnboardingOptionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingOptionPayload>
          }
          deleteMany: {
            args: Prisma.OnboardingOptionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OnboardingOptionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OnboardingOptionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingOptionPayload>[]
          }
          upsert: {
            args: Prisma.OnboardingOptionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingOptionPayload>
          }
          aggregate: {
            args: Prisma.OnboardingOptionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOnboardingOption>
          }
          groupBy: {
            args: Prisma.OnboardingOptionGroupByArgs<ExtArgs>
            result: $Utils.Optional<OnboardingOptionGroupByOutputType>[]
          }
          count: {
            args: Prisma.OnboardingOptionCountArgs<ExtArgs>
            result: $Utils.Optional<OnboardingOptionCountAggregateOutputType> | number
          }
        }
      }
      OnboardingResponse: {
        payload: Prisma.$OnboardingResponsePayload<ExtArgs>
        fields: Prisma.OnboardingResponseFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OnboardingResponseFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingResponsePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OnboardingResponseFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingResponsePayload>
          }
          findFirst: {
            args: Prisma.OnboardingResponseFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingResponsePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OnboardingResponseFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingResponsePayload>
          }
          findMany: {
            args: Prisma.OnboardingResponseFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingResponsePayload>[]
          }
          create: {
            args: Prisma.OnboardingResponseCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingResponsePayload>
          }
          createMany: {
            args: Prisma.OnboardingResponseCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OnboardingResponseCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingResponsePayload>[]
          }
          delete: {
            args: Prisma.OnboardingResponseDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingResponsePayload>
          }
          update: {
            args: Prisma.OnboardingResponseUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingResponsePayload>
          }
          deleteMany: {
            args: Prisma.OnboardingResponseDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OnboardingResponseUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OnboardingResponseUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingResponsePayload>[]
          }
          upsert: {
            args: Prisma.OnboardingResponseUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingResponsePayload>
          }
          aggregate: {
            args: Prisma.OnboardingResponseAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOnboardingResponse>
          }
          groupBy: {
            args: Prisma.OnboardingResponseGroupByArgs<ExtArgs>
            result: $Utils.Optional<OnboardingResponseGroupByOutputType>[]
          }
          count: {
            args: Prisma.OnboardingResponseCountArgs<ExtArgs>
            result: $Utils.Optional<OnboardingResponseCountAggregateOutputType> | number
          }
        }
      }
      OnboardingAnswer: {
        payload: Prisma.$OnboardingAnswerPayload<ExtArgs>
        fields: Prisma.OnboardingAnswerFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OnboardingAnswerFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingAnswerPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OnboardingAnswerFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingAnswerPayload>
          }
          findFirst: {
            args: Prisma.OnboardingAnswerFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingAnswerPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OnboardingAnswerFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingAnswerPayload>
          }
          findMany: {
            args: Prisma.OnboardingAnswerFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingAnswerPayload>[]
          }
          create: {
            args: Prisma.OnboardingAnswerCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingAnswerPayload>
          }
          createMany: {
            args: Prisma.OnboardingAnswerCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OnboardingAnswerCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingAnswerPayload>[]
          }
          delete: {
            args: Prisma.OnboardingAnswerDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingAnswerPayload>
          }
          update: {
            args: Prisma.OnboardingAnswerUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingAnswerPayload>
          }
          deleteMany: {
            args: Prisma.OnboardingAnswerDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OnboardingAnswerUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OnboardingAnswerUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingAnswerPayload>[]
          }
          upsert: {
            args: Prisma.OnboardingAnswerUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OnboardingAnswerPayload>
          }
          aggregate: {
            args: Prisma.OnboardingAnswerAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOnboardingAnswer>
          }
          groupBy: {
            args: Prisma.OnboardingAnswerGroupByArgs<ExtArgs>
            result: $Utils.Optional<OnboardingAnswerGroupByOutputType>[]
          }
          count: {
            args: Prisma.OnboardingAnswerCountArgs<ExtArgs>
            result: $Utils.Optional<OnboardingAnswerCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    adminAccount?: AdminAccountOmit
    blogPost?: BlogPostOmit
    blogTag?: BlogTagOmit
    blogSeo?: BlogSeoOmit
    onboardingTagVersion?: OnboardingTagVersionOmit
    onboardingQuestion?: OnboardingQuestionOmit
    onboardingOption?: OnboardingOptionOmit
    onboardingResponse?: OnboardingResponseOmit
    onboardingAnswer?: OnboardingAnswerOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type AdminAccountCountOutputType
   */

  export type AdminAccountCountOutputType = {
    BlogPost: number
  }

  export type AdminAccountCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    BlogPost?: boolean | AdminAccountCountOutputTypeCountBlogPostArgs
  }

  // Custom InputTypes
  /**
   * AdminAccountCountOutputType without action
   */
  export type AdminAccountCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminAccountCountOutputType
     */
    select?: AdminAccountCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * AdminAccountCountOutputType without action
   */
  export type AdminAccountCountOutputTypeCountBlogPostArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BlogPostWhereInput
  }


  /**
   * Count Type BlogPostCountOutputType
   */

  export type BlogPostCountOutputType = {
    tags: number
  }

  export type BlogPostCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tags?: boolean | BlogPostCountOutputTypeCountTagsArgs
  }

  // Custom InputTypes
  /**
   * BlogPostCountOutputType without action
   */
  export type BlogPostCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogPostCountOutputType
     */
    select?: BlogPostCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * BlogPostCountOutputType without action
   */
  export type BlogPostCountOutputTypeCountTagsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BlogTagWhereInput
  }


  /**
   * Count Type BlogTagCountOutputType
   */

  export type BlogTagCountOutputType = {
    posts: number
  }

  export type BlogTagCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    posts?: boolean | BlogTagCountOutputTypeCountPostsArgs
  }

  // Custom InputTypes
  /**
   * BlogTagCountOutputType without action
   */
  export type BlogTagCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogTagCountOutputType
     */
    select?: BlogTagCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * BlogTagCountOutputType without action
   */
  export type BlogTagCountOutputTypeCountPostsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BlogPostWhereInput
  }


  /**
   * Count Type OnboardingTagVersionCountOutputType
   */

  export type OnboardingTagVersionCountOutputType = {
    questions: number
    responses: number
  }

  export type OnboardingTagVersionCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    questions?: boolean | OnboardingTagVersionCountOutputTypeCountQuestionsArgs
    responses?: boolean | OnboardingTagVersionCountOutputTypeCountResponsesArgs
  }

  // Custom InputTypes
  /**
   * OnboardingTagVersionCountOutputType without action
   */
  export type OnboardingTagVersionCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingTagVersionCountOutputType
     */
    select?: OnboardingTagVersionCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * OnboardingTagVersionCountOutputType without action
   */
  export type OnboardingTagVersionCountOutputTypeCountQuestionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OnboardingQuestionWhereInput
  }

  /**
   * OnboardingTagVersionCountOutputType without action
   */
  export type OnboardingTagVersionCountOutputTypeCountResponsesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OnboardingResponseWhereInput
  }


  /**
   * Count Type OnboardingQuestionCountOutputType
   */

  export type OnboardingQuestionCountOutputType = {
    options: number
    answers: number
  }

  export type OnboardingQuestionCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    options?: boolean | OnboardingQuestionCountOutputTypeCountOptionsArgs
    answers?: boolean | OnboardingQuestionCountOutputTypeCountAnswersArgs
  }

  // Custom InputTypes
  /**
   * OnboardingQuestionCountOutputType without action
   */
  export type OnboardingQuestionCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingQuestionCountOutputType
     */
    select?: OnboardingQuestionCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * OnboardingQuestionCountOutputType without action
   */
  export type OnboardingQuestionCountOutputTypeCountOptionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OnboardingOptionWhereInput
  }

  /**
   * OnboardingQuestionCountOutputType without action
   */
  export type OnboardingQuestionCountOutputTypeCountAnswersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OnboardingAnswerWhereInput
  }


  /**
   * Count Type OnboardingOptionCountOutputType
   */

  export type OnboardingOptionCountOutputType = {
    answers: number
  }

  export type OnboardingOptionCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    answers?: boolean | OnboardingOptionCountOutputTypeCountAnswersArgs
  }

  // Custom InputTypes
  /**
   * OnboardingOptionCountOutputType without action
   */
  export type OnboardingOptionCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingOptionCountOutputType
     */
    select?: OnboardingOptionCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * OnboardingOptionCountOutputType without action
   */
  export type OnboardingOptionCountOutputTypeCountAnswersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OnboardingAnswerWhereInput
  }


  /**
   * Count Type OnboardingResponseCountOutputType
   */

  export type OnboardingResponseCountOutputType = {
    answers: number
  }

  export type OnboardingResponseCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    answers?: boolean | OnboardingResponseCountOutputTypeCountAnswersArgs
  }

  // Custom InputTypes
  /**
   * OnboardingResponseCountOutputType without action
   */
  export type OnboardingResponseCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingResponseCountOutputType
     */
    select?: OnboardingResponseCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * OnboardingResponseCountOutputType without action
   */
  export type OnboardingResponseCountOutputTypeCountAnswersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OnboardingAnswerWhereInput
  }


  /**
   * Models
   */

  /**
   * Model AdminAccount
   */

  export type AggregateAdminAccount = {
    _count: AdminAccountCountAggregateOutputType | null
    _min: AdminAccountMinAggregateOutputType | null
    _max: AdminAccountMaxAggregateOutputType | null
  }

  export type AdminAccountMinAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    picture: string | null
    profileLink: string | null
    designation: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AdminAccountMaxAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    picture: string | null
    profileLink: string | null
    designation: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AdminAccountCountAggregateOutputType = {
    id: number
    name: number
    email: number
    picture: number
    profileLink: number
    designation: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type AdminAccountMinAggregateInputType = {
    id?: true
    name?: true
    email?: true
    picture?: true
    profileLink?: true
    designation?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AdminAccountMaxAggregateInputType = {
    id?: true
    name?: true
    email?: true
    picture?: true
    profileLink?: true
    designation?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AdminAccountCountAggregateInputType = {
    id?: true
    name?: true
    email?: true
    picture?: true
    profileLink?: true
    designation?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type AdminAccountAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AdminAccount to aggregate.
     */
    where?: AdminAccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AdminAccounts to fetch.
     */
    orderBy?: AdminAccountOrderByWithRelationInput | AdminAccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AdminAccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AdminAccounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AdminAccounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AdminAccounts
    **/
    _count?: true | AdminAccountCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AdminAccountMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AdminAccountMaxAggregateInputType
  }

  export type GetAdminAccountAggregateType<T extends AdminAccountAggregateArgs> = {
        [P in keyof T & keyof AggregateAdminAccount]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAdminAccount[P]>
      : GetScalarType<T[P], AggregateAdminAccount[P]>
  }




  export type AdminAccountGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AdminAccountWhereInput
    orderBy?: AdminAccountOrderByWithAggregationInput | AdminAccountOrderByWithAggregationInput[]
    by: AdminAccountScalarFieldEnum[] | AdminAccountScalarFieldEnum
    having?: AdminAccountScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AdminAccountCountAggregateInputType | true
    _min?: AdminAccountMinAggregateInputType
    _max?: AdminAccountMaxAggregateInputType
  }

  export type AdminAccountGroupByOutputType = {
    id: string
    name: string
    email: string
    picture: string | null
    profileLink: string | null
    designation: string | null
    createdAt: Date
    updatedAt: Date
    _count: AdminAccountCountAggregateOutputType | null
    _min: AdminAccountMinAggregateOutputType | null
    _max: AdminAccountMaxAggregateOutputType | null
  }

  type GetAdminAccountGroupByPayload<T extends AdminAccountGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AdminAccountGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AdminAccountGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AdminAccountGroupByOutputType[P]>
            : GetScalarType<T[P], AdminAccountGroupByOutputType[P]>
        }
      >
    >


  export type AdminAccountSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    picture?: boolean
    profileLink?: boolean
    designation?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    BlogPost?: boolean | AdminAccount$BlogPostArgs<ExtArgs>
    _count?: boolean | AdminAccountCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["adminAccount"]>

  export type AdminAccountSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    picture?: boolean
    profileLink?: boolean
    designation?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["adminAccount"]>

  export type AdminAccountSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    picture?: boolean
    profileLink?: boolean
    designation?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["adminAccount"]>

  export type AdminAccountSelectScalar = {
    id?: boolean
    name?: boolean
    email?: boolean
    picture?: boolean
    profileLink?: boolean
    designation?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type AdminAccountOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "email" | "picture" | "profileLink" | "designation" | "createdAt" | "updatedAt", ExtArgs["result"]["adminAccount"]>
  export type AdminAccountInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    BlogPost?: boolean | AdminAccount$BlogPostArgs<ExtArgs>
    _count?: boolean | AdminAccountCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type AdminAccountIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type AdminAccountIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $AdminAccountPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AdminAccount"
    objects: {
      BlogPost: Prisma.$BlogPostPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      email: string
      picture: string | null
      profileLink: string | null
      designation: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["adminAccount"]>
    composites: {}
  }

  type AdminAccountGetPayload<S extends boolean | null | undefined | AdminAccountDefaultArgs> = $Result.GetResult<Prisma.$AdminAccountPayload, S>

  type AdminAccountCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AdminAccountFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AdminAccountCountAggregateInputType | true
    }

  export interface AdminAccountDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AdminAccount'], meta: { name: 'AdminAccount' } }
    /**
     * Find zero or one AdminAccount that matches the filter.
     * @param {AdminAccountFindUniqueArgs} args - Arguments to find a AdminAccount
     * @example
     * // Get one AdminAccount
     * const adminAccount = await prisma.adminAccount.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AdminAccountFindUniqueArgs>(args: SelectSubset<T, AdminAccountFindUniqueArgs<ExtArgs>>): Prisma__AdminAccountClient<$Result.GetResult<Prisma.$AdminAccountPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AdminAccount that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AdminAccountFindUniqueOrThrowArgs} args - Arguments to find a AdminAccount
     * @example
     * // Get one AdminAccount
     * const adminAccount = await prisma.adminAccount.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AdminAccountFindUniqueOrThrowArgs>(args: SelectSubset<T, AdminAccountFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AdminAccountClient<$Result.GetResult<Prisma.$AdminAccountPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AdminAccount that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminAccountFindFirstArgs} args - Arguments to find a AdminAccount
     * @example
     * // Get one AdminAccount
     * const adminAccount = await prisma.adminAccount.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AdminAccountFindFirstArgs>(args?: SelectSubset<T, AdminAccountFindFirstArgs<ExtArgs>>): Prisma__AdminAccountClient<$Result.GetResult<Prisma.$AdminAccountPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AdminAccount that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminAccountFindFirstOrThrowArgs} args - Arguments to find a AdminAccount
     * @example
     * // Get one AdminAccount
     * const adminAccount = await prisma.adminAccount.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AdminAccountFindFirstOrThrowArgs>(args?: SelectSubset<T, AdminAccountFindFirstOrThrowArgs<ExtArgs>>): Prisma__AdminAccountClient<$Result.GetResult<Prisma.$AdminAccountPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AdminAccounts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminAccountFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AdminAccounts
     * const adminAccounts = await prisma.adminAccount.findMany()
     * 
     * // Get first 10 AdminAccounts
     * const adminAccounts = await prisma.adminAccount.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const adminAccountWithIdOnly = await prisma.adminAccount.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AdminAccountFindManyArgs>(args?: SelectSubset<T, AdminAccountFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AdminAccountPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AdminAccount.
     * @param {AdminAccountCreateArgs} args - Arguments to create a AdminAccount.
     * @example
     * // Create one AdminAccount
     * const AdminAccount = await prisma.adminAccount.create({
     *   data: {
     *     // ... data to create a AdminAccount
     *   }
     * })
     * 
     */
    create<T extends AdminAccountCreateArgs>(args: SelectSubset<T, AdminAccountCreateArgs<ExtArgs>>): Prisma__AdminAccountClient<$Result.GetResult<Prisma.$AdminAccountPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AdminAccounts.
     * @param {AdminAccountCreateManyArgs} args - Arguments to create many AdminAccounts.
     * @example
     * // Create many AdminAccounts
     * const adminAccount = await prisma.adminAccount.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AdminAccountCreateManyArgs>(args?: SelectSubset<T, AdminAccountCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AdminAccounts and returns the data saved in the database.
     * @param {AdminAccountCreateManyAndReturnArgs} args - Arguments to create many AdminAccounts.
     * @example
     * // Create many AdminAccounts
     * const adminAccount = await prisma.adminAccount.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AdminAccounts and only return the `id`
     * const adminAccountWithIdOnly = await prisma.adminAccount.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AdminAccountCreateManyAndReturnArgs>(args?: SelectSubset<T, AdminAccountCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AdminAccountPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AdminAccount.
     * @param {AdminAccountDeleteArgs} args - Arguments to delete one AdminAccount.
     * @example
     * // Delete one AdminAccount
     * const AdminAccount = await prisma.adminAccount.delete({
     *   where: {
     *     // ... filter to delete one AdminAccount
     *   }
     * })
     * 
     */
    delete<T extends AdminAccountDeleteArgs>(args: SelectSubset<T, AdminAccountDeleteArgs<ExtArgs>>): Prisma__AdminAccountClient<$Result.GetResult<Prisma.$AdminAccountPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AdminAccount.
     * @param {AdminAccountUpdateArgs} args - Arguments to update one AdminAccount.
     * @example
     * // Update one AdminAccount
     * const adminAccount = await prisma.adminAccount.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AdminAccountUpdateArgs>(args: SelectSubset<T, AdminAccountUpdateArgs<ExtArgs>>): Prisma__AdminAccountClient<$Result.GetResult<Prisma.$AdminAccountPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AdminAccounts.
     * @param {AdminAccountDeleteManyArgs} args - Arguments to filter AdminAccounts to delete.
     * @example
     * // Delete a few AdminAccounts
     * const { count } = await prisma.adminAccount.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AdminAccountDeleteManyArgs>(args?: SelectSubset<T, AdminAccountDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AdminAccounts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminAccountUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AdminAccounts
     * const adminAccount = await prisma.adminAccount.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AdminAccountUpdateManyArgs>(args: SelectSubset<T, AdminAccountUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AdminAccounts and returns the data updated in the database.
     * @param {AdminAccountUpdateManyAndReturnArgs} args - Arguments to update many AdminAccounts.
     * @example
     * // Update many AdminAccounts
     * const adminAccount = await prisma.adminAccount.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AdminAccounts and only return the `id`
     * const adminAccountWithIdOnly = await prisma.adminAccount.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AdminAccountUpdateManyAndReturnArgs>(args: SelectSubset<T, AdminAccountUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AdminAccountPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AdminAccount.
     * @param {AdminAccountUpsertArgs} args - Arguments to update or create a AdminAccount.
     * @example
     * // Update or create a AdminAccount
     * const adminAccount = await prisma.adminAccount.upsert({
     *   create: {
     *     // ... data to create a AdminAccount
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AdminAccount we want to update
     *   }
     * })
     */
    upsert<T extends AdminAccountUpsertArgs>(args: SelectSubset<T, AdminAccountUpsertArgs<ExtArgs>>): Prisma__AdminAccountClient<$Result.GetResult<Prisma.$AdminAccountPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AdminAccounts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminAccountCountArgs} args - Arguments to filter AdminAccounts to count.
     * @example
     * // Count the number of AdminAccounts
     * const count = await prisma.adminAccount.count({
     *   where: {
     *     // ... the filter for the AdminAccounts we want to count
     *   }
     * })
    **/
    count<T extends AdminAccountCountArgs>(
      args?: Subset<T, AdminAccountCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AdminAccountCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AdminAccount.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminAccountAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AdminAccountAggregateArgs>(args: Subset<T, AdminAccountAggregateArgs>): Prisma.PrismaPromise<GetAdminAccountAggregateType<T>>

    /**
     * Group by AdminAccount.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminAccountGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AdminAccountGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AdminAccountGroupByArgs['orderBy'] }
        : { orderBy?: AdminAccountGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AdminAccountGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAdminAccountGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AdminAccount model
   */
  readonly fields: AdminAccountFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AdminAccount.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AdminAccountClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    BlogPost<T extends AdminAccount$BlogPostArgs<ExtArgs> = {}>(args?: Subset<T, AdminAccount$BlogPostArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BlogPostPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AdminAccount model
   */
  interface AdminAccountFieldRefs {
    readonly id: FieldRef<"AdminAccount", 'String'>
    readonly name: FieldRef<"AdminAccount", 'String'>
    readonly email: FieldRef<"AdminAccount", 'String'>
    readonly picture: FieldRef<"AdminAccount", 'String'>
    readonly profileLink: FieldRef<"AdminAccount", 'String'>
    readonly designation: FieldRef<"AdminAccount", 'String'>
    readonly createdAt: FieldRef<"AdminAccount", 'DateTime'>
    readonly updatedAt: FieldRef<"AdminAccount", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AdminAccount findUnique
   */
  export type AdminAccountFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminAccount
     */
    select?: AdminAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminAccount
     */
    omit?: AdminAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AdminAccountInclude<ExtArgs> | null
    /**
     * Filter, which AdminAccount to fetch.
     */
    where: AdminAccountWhereUniqueInput
  }

  /**
   * AdminAccount findUniqueOrThrow
   */
  export type AdminAccountFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminAccount
     */
    select?: AdminAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminAccount
     */
    omit?: AdminAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AdminAccountInclude<ExtArgs> | null
    /**
     * Filter, which AdminAccount to fetch.
     */
    where: AdminAccountWhereUniqueInput
  }

  /**
   * AdminAccount findFirst
   */
  export type AdminAccountFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminAccount
     */
    select?: AdminAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminAccount
     */
    omit?: AdminAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AdminAccountInclude<ExtArgs> | null
    /**
     * Filter, which AdminAccount to fetch.
     */
    where?: AdminAccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AdminAccounts to fetch.
     */
    orderBy?: AdminAccountOrderByWithRelationInput | AdminAccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AdminAccounts.
     */
    cursor?: AdminAccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AdminAccounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AdminAccounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AdminAccounts.
     */
    distinct?: AdminAccountScalarFieldEnum | AdminAccountScalarFieldEnum[]
  }

  /**
   * AdminAccount findFirstOrThrow
   */
  export type AdminAccountFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminAccount
     */
    select?: AdminAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminAccount
     */
    omit?: AdminAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AdminAccountInclude<ExtArgs> | null
    /**
     * Filter, which AdminAccount to fetch.
     */
    where?: AdminAccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AdminAccounts to fetch.
     */
    orderBy?: AdminAccountOrderByWithRelationInput | AdminAccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AdminAccounts.
     */
    cursor?: AdminAccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AdminAccounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AdminAccounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AdminAccounts.
     */
    distinct?: AdminAccountScalarFieldEnum | AdminAccountScalarFieldEnum[]
  }

  /**
   * AdminAccount findMany
   */
  export type AdminAccountFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminAccount
     */
    select?: AdminAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminAccount
     */
    omit?: AdminAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AdminAccountInclude<ExtArgs> | null
    /**
     * Filter, which AdminAccounts to fetch.
     */
    where?: AdminAccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AdminAccounts to fetch.
     */
    orderBy?: AdminAccountOrderByWithRelationInput | AdminAccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AdminAccounts.
     */
    cursor?: AdminAccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AdminAccounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AdminAccounts.
     */
    skip?: number
    distinct?: AdminAccountScalarFieldEnum | AdminAccountScalarFieldEnum[]
  }

  /**
   * AdminAccount create
   */
  export type AdminAccountCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminAccount
     */
    select?: AdminAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminAccount
     */
    omit?: AdminAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AdminAccountInclude<ExtArgs> | null
    /**
     * The data needed to create a AdminAccount.
     */
    data: XOR<AdminAccountCreateInput, AdminAccountUncheckedCreateInput>
  }

  /**
   * AdminAccount createMany
   */
  export type AdminAccountCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AdminAccounts.
     */
    data: AdminAccountCreateManyInput | AdminAccountCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AdminAccount createManyAndReturn
   */
  export type AdminAccountCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminAccount
     */
    select?: AdminAccountSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AdminAccount
     */
    omit?: AdminAccountOmit<ExtArgs> | null
    /**
     * The data used to create many AdminAccounts.
     */
    data: AdminAccountCreateManyInput | AdminAccountCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AdminAccount update
   */
  export type AdminAccountUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminAccount
     */
    select?: AdminAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminAccount
     */
    omit?: AdminAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AdminAccountInclude<ExtArgs> | null
    /**
     * The data needed to update a AdminAccount.
     */
    data: XOR<AdminAccountUpdateInput, AdminAccountUncheckedUpdateInput>
    /**
     * Choose, which AdminAccount to update.
     */
    where: AdminAccountWhereUniqueInput
  }

  /**
   * AdminAccount updateMany
   */
  export type AdminAccountUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AdminAccounts.
     */
    data: XOR<AdminAccountUpdateManyMutationInput, AdminAccountUncheckedUpdateManyInput>
    /**
     * Filter which AdminAccounts to update
     */
    where?: AdminAccountWhereInput
    /**
     * Limit how many AdminAccounts to update.
     */
    limit?: number
  }

  /**
   * AdminAccount updateManyAndReturn
   */
  export type AdminAccountUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminAccount
     */
    select?: AdminAccountSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AdminAccount
     */
    omit?: AdminAccountOmit<ExtArgs> | null
    /**
     * The data used to update AdminAccounts.
     */
    data: XOR<AdminAccountUpdateManyMutationInput, AdminAccountUncheckedUpdateManyInput>
    /**
     * Filter which AdminAccounts to update
     */
    where?: AdminAccountWhereInput
    /**
     * Limit how many AdminAccounts to update.
     */
    limit?: number
  }

  /**
   * AdminAccount upsert
   */
  export type AdminAccountUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminAccount
     */
    select?: AdminAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminAccount
     */
    omit?: AdminAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AdminAccountInclude<ExtArgs> | null
    /**
     * The filter to search for the AdminAccount to update in case it exists.
     */
    where: AdminAccountWhereUniqueInput
    /**
     * In case the AdminAccount found by the `where` argument doesn't exist, create a new AdminAccount with this data.
     */
    create: XOR<AdminAccountCreateInput, AdminAccountUncheckedCreateInput>
    /**
     * In case the AdminAccount was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AdminAccountUpdateInput, AdminAccountUncheckedUpdateInput>
  }

  /**
   * AdminAccount delete
   */
  export type AdminAccountDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminAccount
     */
    select?: AdminAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminAccount
     */
    omit?: AdminAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AdminAccountInclude<ExtArgs> | null
    /**
     * Filter which AdminAccount to delete.
     */
    where: AdminAccountWhereUniqueInput
  }

  /**
   * AdminAccount deleteMany
   */
  export type AdminAccountDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AdminAccounts to delete
     */
    where?: AdminAccountWhereInput
    /**
     * Limit how many AdminAccounts to delete.
     */
    limit?: number
  }

  /**
   * AdminAccount.BlogPost
   */
  export type AdminAccount$BlogPostArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogPost
     */
    select?: BlogPostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogPost
     */
    omit?: BlogPostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogPostInclude<ExtArgs> | null
    where?: BlogPostWhereInput
    orderBy?: BlogPostOrderByWithRelationInput | BlogPostOrderByWithRelationInput[]
    cursor?: BlogPostWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BlogPostScalarFieldEnum | BlogPostScalarFieldEnum[]
  }

  /**
   * AdminAccount without action
   */
  export type AdminAccountDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdminAccount
     */
    select?: AdminAccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdminAccount
     */
    omit?: AdminAccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AdminAccountInclude<ExtArgs> | null
  }


  /**
   * Model BlogPost
   */

  export type AggregateBlogPost = {
    _count: BlogPostCountAggregateOutputType | null
    _min: BlogPostMinAggregateOutputType | null
    _max: BlogPostMaxAggregateOutputType | null
  }

  export type BlogPostMinAggregateOutputType = {
    id: string | null
    type: $Enums.BlogPostType | null
    title: string | null
    slug: string | null
    authorId: string | null
    status: $Enums.BlogPostStatus | null
    deletedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BlogPostMaxAggregateOutputType = {
    id: string | null
    type: $Enums.BlogPostType | null
    title: string | null
    slug: string | null
    authorId: string | null
    status: $Enums.BlogPostStatus | null
    deletedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BlogPostCountAggregateOutputType = {
    id: number
    type: number
    title: number
    slug: number
    authorId: number
    status: number
    content: number
    deletedAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type BlogPostMinAggregateInputType = {
    id?: true
    type?: true
    title?: true
    slug?: true
    authorId?: true
    status?: true
    deletedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BlogPostMaxAggregateInputType = {
    id?: true
    type?: true
    title?: true
    slug?: true
    authorId?: true
    status?: true
    deletedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BlogPostCountAggregateInputType = {
    id?: true
    type?: true
    title?: true
    slug?: true
    authorId?: true
    status?: true
    content?: true
    deletedAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type BlogPostAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BlogPost to aggregate.
     */
    where?: BlogPostWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BlogPosts to fetch.
     */
    orderBy?: BlogPostOrderByWithRelationInput | BlogPostOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BlogPostWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BlogPosts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BlogPosts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned BlogPosts
    **/
    _count?: true | BlogPostCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BlogPostMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BlogPostMaxAggregateInputType
  }

  export type GetBlogPostAggregateType<T extends BlogPostAggregateArgs> = {
        [P in keyof T & keyof AggregateBlogPost]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBlogPost[P]>
      : GetScalarType<T[P], AggregateBlogPost[P]>
  }




  export type BlogPostGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BlogPostWhereInput
    orderBy?: BlogPostOrderByWithAggregationInput | BlogPostOrderByWithAggregationInput[]
    by: BlogPostScalarFieldEnum[] | BlogPostScalarFieldEnum
    having?: BlogPostScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BlogPostCountAggregateInputType | true
    _min?: BlogPostMinAggregateInputType
    _max?: BlogPostMaxAggregateInputType
  }

  export type BlogPostGroupByOutputType = {
    id: string
    type: $Enums.BlogPostType
    title: string
    slug: string
    authorId: string
    status: $Enums.BlogPostStatus
    content: JsonValue
    deletedAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: BlogPostCountAggregateOutputType | null
    _min: BlogPostMinAggregateOutputType | null
    _max: BlogPostMaxAggregateOutputType | null
  }

  type GetBlogPostGroupByPayload<T extends BlogPostGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BlogPostGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BlogPostGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BlogPostGroupByOutputType[P]>
            : GetScalarType<T[P], BlogPostGroupByOutputType[P]>
        }
      >
    >


  export type BlogPostSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    type?: boolean
    title?: boolean
    slug?: boolean
    authorId?: boolean
    status?: boolean
    content?: boolean
    deletedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tags?: boolean | BlogPost$tagsArgs<ExtArgs>
    author?: boolean | AdminAccountDefaultArgs<ExtArgs>
    seo?: boolean | BlogPost$seoArgs<ExtArgs>
    _count?: boolean | BlogPostCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["blogPost"]>

  export type BlogPostSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    type?: boolean
    title?: boolean
    slug?: boolean
    authorId?: boolean
    status?: boolean
    content?: boolean
    deletedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    author?: boolean | AdminAccountDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["blogPost"]>

  export type BlogPostSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    type?: boolean
    title?: boolean
    slug?: boolean
    authorId?: boolean
    status?: boolean
    content?: boolean
    deletedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    author?: boolean | AdminAccountDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["blogPost"]>

  export type BlogPostSelectScalar = {
    id?: boolean
    type?: boolean
    title?: boolean
    slug?: boolean
    authorId?: boolean
    status?: boolean
    content?: boolean
    deletedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type BlogPostOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "type" | "title" | "slug" | "authorId" | "status" | "content" | "deletedAt" | "createdAt" | "updatedAt", ExtArgs["result"]["blogPost"]>
  export type BlogPostInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tags?: boolean | BlogPost$tagsArgs<ExtArgs>
    author?: boolean | AdminAccountDefaultArgs<ExtArgs>
    seo?: boolean | BlogPost$seoArgs<ExtArgs>
    _count?: boolean | BlogPostCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type BlogPostIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    author?: boolean | AdminAccountDefaultArgs<ExtArgs>
  }
  export type BlogPostIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    author?: boolean | AdminAccountDefaultArgs<ExtArgs>
  }

  export type $BlogPostPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "BlogPost"
    objects: {
      tags: Prisma.$BlogTagPayload<ExtArgs>[]
      author: Prisma.$AdminAccountPayload<ExtArgs>
      seo: Prisma.$BlogSeoPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      type: $Enums.BlogPostType
      title: string
      slug: string
      authorId: string
      status: $Enums.BlogPostStatus
      content: Prisma.JsonValue
      deletedAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["blogPost"]>
    composites: {}
  }

  type BlogPostGetPayload<S extends boolean | null | undefined | BlogPostDefaultArgs> = $Result.GetResult<Prisma.$BlogPostPayload, S>

  type BlogPostCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<BlogPostFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: BlogPostCountAggregateInputType | true
    }

  export interface BlogPostDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['BlogPost'], meta: { name: 'BlogPost' } }
    /**
     * Find zero or one BlogPost that matches the filter.
     * @param {BlogPostFindUniqueArgs} args - Arguments to find a BlogPost
     * @example
     * // Get one BlogPost
     * const blogPost = await prisma.blogPost.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BlogPostFindUniqueArgs>(args: SelectSubset<T, BlogPostFindUniqueArgs<ExtArgs>>): Prisma__BlogPostClient<$Result.GetResult<Prisma.$BlogPostPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one BlogPost that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {BlogPostFindUniqueOrThrowArgs} args - Arguments to find a BlogPost
     * @example
     * // Get one BlogPost
     * const blogPost = await prisma.blogPost.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BlogPostFindUniqueOrThrowArgs>(args: SelectSubset<T, BlogPostFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BlogPostClient<$Result.GetResult<Prisma.$BlogPostPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first BlogPost that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BlogPostFindFirstArgs} args - Arguments to find a BlogPost
     * @example
     * // Get one BlogPost
     * const blogPost = await prisma.blogPost.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BlogPostFindFirstArgs>(args?: SelectSubset<T, BlogPostFindFirstArgs<ExtArgs>>): Prisma__BlogPostClient<$Result.GetResult<Prisma.$BlogPostPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first BlogPost that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BlogPostFindFirstOrThrowArgs} args - Arguments to find a BlogPost
     * @example
     * // Get one BlogPost
     * const blogPost = await prisma.blogPost.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BlogPostFindFirstOrThrowArgs>(args?: SelectSubset<T, BlogPostFindFirstOrThrowArgs<ExtArgs>>): Prisma__BlogPostClient<$Result.GetResult<Prisma.$BlogPostPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more BlogPosts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BlogPostFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all BlogPosts
     * const blogPosts = await prisma.blogPost.findMany()
     * 
     * // Get first 10 BlogPosts
     * const blogPosts = await prisma.blogPost.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const blogPostWithIdOnly = await prisma.blogPost.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BlogPostFindManyArgs>(args?: SelectSubset<T, BlogPostFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BlogPostPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a BlogPost.
     * @param {BlogPostCreateArgs} args - Arguments to create a BlogPost.
     * @example
     * // Create one BlogPost
     * const BlogPost = await prisma.blogPost.create({
     *   data: {
     *     // ... data to create a BlogPost
     *   }
     * })
     * 
     */
    create<T extends BlogPostCreateArgs>(args: SelectSubset<T, BlogPostCreateArgs<ExtArgs>>): Prisma__BlogPostClient<$Result.GetResult<Prisma.$BlogPostPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many BlogPosts.
     * @param {BlogPostCreateManyArgs} args - Arguments to create many BlogPosts.
     * @example
     * // Create many BlogPosts
     * const blogPost = await prisma.blogPost.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BlogPostCreateManyArgs>(args?: SelectSubset<T, BlogPostCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many BlogPosts and returns the data saved in the database.
     * @param {BlogPostCreateManyAndReturnArgs} args - Arguments to create many BlogPosts.
     * @example
     * // Create many BlogPosts
     * const blogPost = await prisma.blogPost.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many BlogPosts and only return the `id`
     * const blogPostWithIdOnly = await prisma.blogPost.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends BlogPostCreateManyAndReturnArgs>(args?: SelectSubset<T, BlogPostCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BlogPostPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a BlogPost.
     * @param {BlogPostDeleteArgs} args - Arguments to delete one BlogPost.
     * @example
     * // Delete one BlogPost
     * const BlogPost = await prisma.blogPost.delete({
     *   where: {
     *     // ... filter to delete one BlogPost
     *   }
     * })
     * 
     */
    delete<T extends BlogPostDeleteArgs>(args: SelectSubset<T, BlogPostDeleteArgs<ExtArgs>>): Prisma__BlogPostClient<$Result.GetResult<Prisma.$BlogPostPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one BlogPost.
     * @param {BlogPostUpdateArgs} args - Arguments to update one BlogPost.
     * @example
     * // Update one BlogPost
     * const blogPost = await prisma.blogPost.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BlogPostUpdateArgs>(args: SelectSubset<T, BlogPostUpdateArgs<ExtArgs>>): Prisma__BlogPostClient<$Result.GetResult<Prisma.$BlogPostPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more BlogPosts.
     * @param {BlogPostDeleteManyArgs} args - Arguments to filter BlogPosts to delete.
     * @example
     * // Delete a few BlogPosts
     * const { count } = await prisma.blogPost.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BlogPostDeleteManyArgs>(args?: SelectSubset<T, BlogPostDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BlogPosts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BlogPostUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many BlogPosts
     * const blogPost = await prisma.blogPost.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BlogPostUpdateManyArgs>(args: SelectSubset<T, BlogPostUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BlogPosts and returns the data updated in the database.
     * @param {BlogPostUpdateManyAndReturnArgs} args - Arguments to update many BlogPosts.
     * @example
     * // Update many BlogPosts
     * const blogPost = await prisma.blogPost.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more BlogPosts and only return the `id`
     * const blogPostWithIdOnly = await prisma.blogPost.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends BlogPostUpdateManyAndReturnArgs>(args: SelectSubset<T, BlogPostUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BlogPostPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one BlogPost.
     * @param {BlogPostUpsertArgs} args - Arguments to update or create a BlogPost.
     * @example
     * // Update or create a BlogPost
     * const blogPost = await prisma.blogPost.upsert({
     *   create: {
     *     // ... data to create a BlogPost
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the BlogPost we want to update
     *   }
     * })
     */
    upsert<T extends BlogPostUpsertArgs>(args: SelectSubset<T, BlogPostUpsertArgs<ExtArgs>>): Prisma__BlogPostClient<$Result.GetResult<Prisma.$BlogPostPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of BlogPosts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BlogPostCountArgs} args - Arguments to filter BlogPosts to count.
     * @example
     * // Count the number of BlogPosts
     * const count = await prisma.blogPost.count({
     *   where: {
     *     // ... the filter for the BlogPosts we want to count
     *   }
     * })
    **/
    count<T extends BlogPostCountArgs>(
      args?: Subset<T, BlogPostCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BlogPostCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a BlogPost.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BlogPostAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BlogPostAggregateArgs>(args: Subset<T, BlogPostAggregateArgs>): Prisma.PrismaPromise<GetBlogPostAggregateType<T>>

    /**
     * Group by BlogPost.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BlogPostGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends BlogPostGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BlogPostGroupByArgs['orderBy'] }
        : { orderBy?: BlogPostGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, BlogPostGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBlogPostGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the BlogPost model
   */
  readonly fields: BlogPostFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for BlogPost.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BlogPostClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tags<T extends BlogPost$tagsArgs<ExtArgs> = {}>(args?: Subset<T, BlogPost$tagsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BlogTagPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    author<T extends AdminAccountDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AdminAccountDefaultArgs<ExtArgs>>): Prisma__AdminAccountClient<$Result.GetResult<Prisma.$AdminAccountPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    seo<T extends BlogPost$seoArgs<ExtArgs> = {}>(args?: Subset<T, BlogPost$seoArgs<ExtArgs>>): Prisma__BlogSeoClient<$Result.GetResult<Prisma.$BlogSeoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the BlogPost model
   */
  interface BlogPostFieldRefs {
    readonly id: FieldRef<"BlogPost", 'String'>
    readonly type: FieldRef<"BlogPost", 'BlogPostType'>
    readonly title: FieldRef<"BlogPost", 'String'>
    readonly slug: FieldRef<"BlogPost", 'String'>
    readonly authorId: FieldRef<"BlogPost", 'String'>
    readonly status: FieldRef<"BlogPost", 'BlogPostStatus'>
    readonly content: FieldRef<"BlogPost", 'Json'>
    readonly deletedAt: FieldRef<"BlogPost", 'DateTime'>
    readonly createdAt: FieldRef<"BlogPost", 'DateTime'>
    readonly updatedAt: FieldRef<"BlogPost", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * BlogPost findUnique
   */
  export type BlogPostFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogPost
     */
    select?: BlogPostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogPost
     */
    omit?: BlogPostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogPostInclude<ExtArgs> | null
    /**
     * Filter, which BlogPost to fetch.
     */
    where: BlogPostWhereUniqueInput
  }

  /**
   * BlogPost findUniqueOrThrow
   */
  export type BlogPostFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogPost
     */
    select?: BlogPostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogPost
     */
    omit?: BlogPostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogPostInclude<ExtArgs> | null
    /**
     * Filter, which BlogPost to fetch.
     */
    where: BlogPostWhereUniqueInput
  }

  /**
   * BlogPost findFirst
   */
  export type BlogPostFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogPost
     */
    select?: BlogPostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogPost
     */
    omit?: BlogPostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogPostInclude<ExtArgs> | null
    /**
     * Filter, which BlogPost to fetch.
     */
    where?: BlogPostWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BlogPosts to fetch.
     */
    orderBy?: BlogPostOrderByWithRelationInput | BlogPostOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BlogPosts.
     */
    cursor?: BlogPostWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BlogPosts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BlogPosts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BlogPosts.
     */
    distinct?: BlogPostScalarFieldEnum | BlogPostScalarFieldEnum[]
  }

  /**
   * BlogPost findFirstOrThrow
   */
  export type BlogPostFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogPost
     */
    select?: BlogPostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogPost
     */
    omit?: BlogPostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogPostInclude<ExtArgs> | null
    /**
     * Filter, which BlogPost to fetch.
     */
    where?: BlogPostWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BlogPosts to fetch.
     */
    orderBy?: BlogPostOrderByWithRelationInput | BlogPostOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BlogPosts.
     */
    cursor?: BlogPostWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BlogPosts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BlogPosts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BlogPosts.
     */
    distinct?: BlogPostScalarFieldEnum | BlogPostScalarFieldEnum[]
  }

  /**
   * BlogPost findMany
   */
  export type BlogPostFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogPost
     */
    select?: BlogPostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogPost
     */
    omit?: BlogPostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogPostInclude<ExtArgs> | null
    /**
     * Filter, which BlogPosts to fetch.
     */
    where?: BlogPostWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BlogPosts to fetch.
     */
    orderBy?: BlogPostOrderByWithRelationInput | BlogPostOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing BlogPosts.
     */
    cursor?: BlogPostWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BlogPosts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BlogPosts.
     */
    skip?: number
    distinct?: BlogPostScalarFieldEnum | BlogPostScalarFieldEnum[]
  }

  /**
   * BlogPost create
   */
  export type BlogPostCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogPost
     */
    select?: BlogPostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogPost
     */
    omit?: BlogPostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogPostInclude<ExtArgs> | null
    /**
     * The data needed to create a BlogPost.
     */
    data: XOR<BlogPostCreateInput, BlogPostUncheckedCreateInput>
  }

  /**
   * BlogPost createMany
   */
  export type BlogPostCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many BlogPosts.
     */
    data: BlogPostCreateManyInput | BlogPostCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * BlogPost createManyAndReturn
   */
  export type BlogPostCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogPost
     */
    select?: BlogPostSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the BlogPost
     */
    omit?: BlogPostOmit<ExtArgs> | null
    /**
     * The data used to create many BlogPosts.
     */
    data: BlogPostCreateManyInput | BlogPostCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogPostIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * BlogPost update
   */
  export type BlogPostUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogPost
     */
    select?: BlogPostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogPost
     */
    omit?: BlogPostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogPostInclude<ExtArgs> | null
    /**
     * The data needed to update a BlogPost.
     */
    data: XOR<BlogPostUpdateInput, BlogPostUncheckedUpdateInput>
    /**
     * Choose, which BlogPost to update.
     */
    where: BlogPostWhereUniqueInput
  }

  /**
   * BlogPost updateMany
   */
  export type BlogPostUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update BlogPosts.
     */
    data: XOR<BlogPostUpdateManyMutationInput, BlogPostUncheckedUpdateManyInput>
    /**
     * Filter which BlogPosts to update
     */
    where?: BlogPostWhereInput
    /**
     * Limit how many BlogPosts to update.
     */
    limit?: number
  }

  /**
   * BlogPost updateManyAndReturn
   */
  export type BlogPostUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogPost
     */
    select?: BlogPostSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the BlogPost
     */
    omit?: BlogPostOmit<ExtArgs> | null
    /**
     * The data used to update BlogPosts.
     */
    data: XOR<BlogPostUpdateManyMutationInput, BlogPostUncheckedUpdateManyInput>
    /**
     * Filter which BlogPosts to update
     */
    where?: BlogPostWhereInput
    /**
     * Limit how many BlogPosts to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogPostIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * BlogPost upsert
   */
  export type BlogPostUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogPost
     */
    select?: BlogPostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogPost
     */
    omit?: BlogPostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogPostInclude<ExtArgs> | null
    /**
     * The filter to search for the BlogPost to update in case it exists.
     */
    where: BlogPostWhereUniqueInput
    /**
     * In case the BlogPost found by the `where` argument doesn't exist, create a new BlogPost with this data.
     */
    create: XOR<BlogPostCreateInput, BlogPostUncheckedCreateInput>
    /**
     * In case the BlogPost was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BlogPostUpdateInput, BlogPostUncheckedUpdateInput>
  }

  /**
   * BlogPost delete
   */
  export type BlogPostDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogPost
     */
    select?: BlogPostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogPost
     */
    omit?: BlogPostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogPostInclude<ExtArgs> | null
    /**
     * Filter which BlogPost to delete.
     */
    where: BlogPostWhereUniqueInput
  }

  /**
   * BlogPost deleteMany
   */
  export type BlogPostDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BlogPosts to delete
     */
    where?: BlogPostWhereInput
    /**
     * Limit how many BlogPosts to delete.
     */
    limit?: number
  }

  /**
   * BlogPost.tags
   */
  export type BlogPost$tagsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogTag
     */
    select?: BlogTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogTag
     */
    omit?: BlogTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogTagInclude<ExtArgs> | null
    where?: BlogTagWhereInput
    orderBy?: BlogTagOrderByWithRelationInput | BlogTagOrderByWithRelationInput[]
    cursor?: BlogTagWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BlogTagScalarFieldEnum | BlogTagScalarFieldEnum[]
  }

  /**
   * BlogPost.seo
   */
  export type BlogPost$seoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogSeo
     */
    select?: BlogSeoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogSeo
     */
    omit?: BlogSeoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogSeoInclude<ExtArgs> | null
    where?: BlogSeoWhereInput
  }

  /**
   * BlogPost without action
   */
  export type BlogPostDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogPost
     */
    select?: BlogPostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogPost
     */
    omit?: BlogPostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogPostInclude<ExtArgs> | null
  }


  /**
   * Model BlogTag
   */

  export type AggregateBlogTag = {
    _count: BlogTagCountAggregateOutputType | null
    _min: BlogTagMinAggregateOutputType | null
    _max: BlogTagMaxAggregateOutputType | null
  }

  export type BlogTagMinAggregateOutputType = {
    id: string | null
    tag: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BlogTagMaxAggregateOutputType = {
    id: string | null
    tag: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BlogTagCountAggregateOutputType = {
    id: number
    tag: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type BlogTagMinAggregateInputType = {
    id?: true
    tag?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BlogTagMaxAggregateInputType = {
    id?: true
    tag?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BlogTagCountAggregateInputType = {
    id?: true
    tag?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type BlogTagAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BlogTag to aggregate.
     */
    where?: BlogTagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BlogTags to fetch.
     */
    orderBy?: BlogTagOrderByWithRelationInput | BlogTagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BlogTagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BlogTags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BlogTags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned BlogTags
    **/
    _count?: true | BlogTagCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BlogTagMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BlogTagMaxAggregateInputType
  }

  export type GetBlogTagAggregateType<T extends BlogTagAggregateArgs> = {
        [P in keyof T & keyof AggregateBlogTag]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBlogTag[P]>
      : GetScalarType<T[P], AggregateBlogTag[P]>
  }




  export type BlogTagGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BlogTagWhereInput
    orderBy?: BlogTagOrderByWithAggregationInput | BlogTagOrderByWithAggregationInput[]
    by: BlogTagScalarFieldEnum[] | BlogTagScalarFieldEnum
    having?: BlogTagScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BlogTagCountAggregateInputType | true
    _min?: BlogTagMinAggregateInputType
    _max?: BlogTagMaxAggregateInputType
  }

  export type BlogTagGroupByOutputType = {
    id: string
    tag: string
    createdAt: Date
    updatedAt: Date
    _count: BlogTagCountAggregateOutputType | null
    _min: BlogTagMinAggregateOutputType | null
    _max: BlogTagMaxAggregateOutputType | null
  }

  type GetBlogTagGroupByPayload<T extends BlogTagGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BlogTagGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BlogTagGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BlogTagGroupByOutputType[P]>
            : GetScalarType<T[P], BlogTagGroupByOutputType[P]>
        }
      >
    >


  export type BlogTagSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tag?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    posts?: boolean | BlogTag$postsArgs<ExtArgs>
    _count?: boolean | BlogTagCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["blogTag"]>

  export type BlogTagSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tag?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["blogTag"]>

  export type BlogTagSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tag?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["blogTag"]>

  export type BlogTagSelectScalar = {
    id?: boolean
    tag?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type BlogTagOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tag" | "createdAt" | "updatedAt", ExtArgs["result"]["blogTag"]>
  export type BlogTagInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    posts?: boolean | BlogTag$postsArgs<ExtArgs>
    _count?: boolean | BlogTagCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type BlogTagIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type BlogTagIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $BlogTagPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "BlogTag"
    objects: {
      posts: Prisma.$BlogPostPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tag: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["blogTag"]>
    composites: {}
  }

  type BlogTagGetPayload<S extends boolean | null | undefined | BlogTagDefaultArgs> = $Result.GetResult<Prisma.$BlogTagPayload, S>

  type BlogTagCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<BlogTagFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: BlogTagCountAggregateInputType | true
    }

  export interface BlogTagDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['BlogTag'], meta: { name: 'BlogTag' } }
    /**
     * Find zero or one BlogTag that matches the filter.
     * @param {BlogTagFindUniqueArgs} args - Arguments to find a BlogTag
     * @example
     * // Get one BlogTag
     * const blogTag = await prisma.blogTag.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BlogTagFindUniqueArgs>(args: SelectSubset<T, BlogTagFindUniqueArgs<ExtArgs>>): Prisma__BlogTagClient<$Result.GetResult<Prisma.$BlogTagPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one BlogTag that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {BlogTagFindUniqueOrThrowArgs} args - Arguments to find a BlogTag
     * @example
     * // Get one BlogTag
     * const blogTag = await prisma.blogTag.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BlogTagFindUniqueOrThrowArgs>(args: SelectSubset<T, BlogTagFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BlogTagClient<$Result.GetResult<Prisma.$BlogTagPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first BlogTag that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BlogTagFindFirstArgs} args - Arguments to find a BlogTag
     * @example
     * // Get one BlogTag
     * const blogTag = await prisma.blogTag.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BlogTagFindFirstArgs>(args?: SelectSubset<T, BlogTagFindFirstArgs<ExtArgs>>): Prisma__BlogTagClient<$Result.GetResult<Prisma.$BlogTagPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first BlogTag that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BlogTagFindFirstOrThrowArgs} args - Arguments to find a BlogTag
     * @example
     * // Get one BlogTag
     * const blogTag = await prisma.blogTag.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BlogTagFindFirstOrThrowArgs>(args?: SelectSubset<T, BlogTagFindFirstOrThrowArgs<ExtArgs>>): Prisma__BlogTagClient<$Result.GetResult<Prisma.$BlogTagPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more BlogTags that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BlogTagFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all BlogTags
     * const blogTags = await prisma.blogTag.findMany()
     * 
     * // Get first 10 BlogTags
     * const blogTags = await prisma.blogTag.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const blogTagWithIdOnly = await prisma.blogTag.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BlogTagFindManyArgs>(args?: SelectSubset<T, BlogTagFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BlogTagPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a BlogTag.
     * @param {BlogTagCreateArgs} args - Arguments to create a BlogTag.
     * @example
     * // Create one BlogTag
     * const BlogTag = await prisma.blogTag.create({
     *   data: {
     *     // ... data to create a BlogTag
     *   }
     * })
     * 
     */
    create<T extends BlogTagCreateArgs>(args: SelectSubset<T, BlogTagCreateArgs<ExtArgs>>): Prisma__BlogTagClient<$Result.GetResult<Prisma.$BlogTagPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many BlogTags.
     * @param {BlogTagCreateManyArgs} args - Arguments to create many BlogTags.
     * @example
     * // Create many BlogTags
     * const blogTag = await prisma.blogTag.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BlogTagCreateManyArgs>(args?: SelectSubset<T, BlogTagCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many BlogTags and returns the data saved in the database.
     * @param {BlogTagCreateManyAndReturnArgs} args - Arguments to create many BlogTags.
     * @example
     * // Create many BlogTags
     * const blogTag = await prisma.blogTag.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many BlogTags and only return the `id`
     * const blogTagWithIdOnly = await prisma.blogTag.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends BlogTagCreateManyAndReturnArgs>(args?: SelectSubset<T, BlogTagCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BlogTagPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a BlogTag.
     * @param {BlogTagDeleteArgs} args - Arguments to delete one BlogTag.
     * @example
     * // Delete one BlogTag
     * const BlogTag = await prisma.blogTag.delete({
     *   where: {
     *     // ... filter to delete one BlogTag
     *   }
     * })
     * 
     */
    delete<T extends BlogTagDeleteArgs>(args: SelectSubset<T, BlogTagDeleteArgs<ExtArgs>>): Prisma__BlogTagClient<$Result.GetResult<Prisma.$BlogTagPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one BlogTag.
     * @param {BlogTagUpdateArgs} args - Arguments to update one BlogTag.
     * @example
     * // Update one BlogTag
     * const blogTag = await prisma.blogTag.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BlogTagUpdateArgs>(args: SelectSubset<T, BlogTagUpdateArgs<ExtArgs>>): Prisma__BlogTagClient<$Result.GetResult<Prisma.$BlogTagPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more BlogTags.
     * @param {BlogTagDeleteManyArgs} args - Arguments to filter BlogTags to delete.
     * @example
     * // Delete a few BlogTags
     * const { count } = await prisma.blogTag.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BlogTagDeleteManyArgs>(args?: SelectSubset<T, BlogTagDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BlogTags.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BlogTagUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many BlogTags
     * const blogTag = await prisma.blogTag.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BlogTagUpdateManyArgs>(args: SelectSubset<T, BlogTagUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BlogTags and returns the data updated in the database.
     * @param {BlogTagUpdateManyAndReturnArgs} args - Arguments to update many BlogTags.
     * @example
     * // Update many BlogTags
     * const blogTag = await prisma.blogTag.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more BlogTags and only return the `id`
     * const blogTagWithIdOnly = await prisma.blogTag.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends BlogTagUpdateManyAndReturnArgs>(args: SelectSubset<T, BlogTagUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BlogTagPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one BlogTag.
     * @param {BlogTagUpsertArgs} args - Arguments to update or create a BlogTag.
     * @example
     * // Update or create a BlogTag
     * const blogTag = await prisma.blogTag.upsert({
     *   create: {
     *     // ... data to create a BlogTag
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the BlogTag we want to update
     *   }
     * })
     */
    upsert<T extends BlogTagUpsertArgs>(args: SelectSubset<T, BlogTagUpsertArgs<ExtArgs>>): Prisma__BlogTagClient<$Result.GetResult<Prisma.$BlogTagPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of BlogTags.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BlogTagCountArgs} args - Arguments to filter BlogTags to count.
     * @example
     * // Count the number of BlogTags
     * const count = await prisma.blogTag.count({
     *   where: {
     *     // ... the filter for the BlogTags we want to count
     *   }
     * })
    **/
    count<T extends BlogTagCountArgs>(
      args?: Subset<T, BlogTagCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BlogTagCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a BlogTag.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BlogTagAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BlogTagAggregateArgs>(args: Subset<T, BlogTagAggregateArgs>): Prisma.PrismaPromise<GetBlogTagAggregateType<T>>

    /**
     * Group by BlogTag.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BlogTagGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends BlogTagGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BlogTagGroupByArgs['orderBy'] }
        : { orderBy?: BlogTagGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, BlogTagGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBlogTagGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the BlogTag model
   */
  readonly fields: BlogTagFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for BlogTag.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BlogTagClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    posts<T extends BlogTag$postsArgs<ExtArgs> = {}>(args?: Subset<T, BlogTag$postsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BlogPostPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the BlogTag model
   */
  interface BlogTagFieldRefs {
    readonly id: FieldRef<"BlogTag", 'String'>
    readonly tag: FieldRef<"BlogTag", 'String'>
    readonly createdAt: FieldRef<"BlogTag", 'DateTime'>
    readonly updatedAt: FieldRef<"BlogTag", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * BlogTag findUnique
   */
  export type BlogTagFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogTag
     */
    select?: BlogTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogTag
     */
    omit?: BlogTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogTagInclude<ExtArgs> | null
    /**
     * Filter, which BlogTag to fetch.
     */
    where: BlogTagWhereUniqueInput
  }

  /**
   * BlogTag findUniqueOrThrow
   */
  export type BlogTagFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogTag
     */
    select?: BlogTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogTag
     */
    omit?: BlogTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogTagInclude<ExtArgs> | null
    /**
     * Filter, which BlogTag to fetch.
     */
    where: BlogTagWhereUniqueInput
  }

  /**
   * BlogTag findFirst
   */
  export type BlogTagFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogTag
     */
    select?: BlogTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogTag
     */
    omit?: BlogTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogTagInclude<ExtArgs> | null
    /**
     * Filter, which BlogTag to fetch.
     */
    where?: BlogTagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BlogTags to fetch.
     */
    orderBy?: BlogTagOrderByWithRelationInput | BlogTagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BlogTags.
     */
    cursor?: BlogTagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BlogTags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BlogTags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BlogTags.
     */
    distinct?: BlogTagScalarFieldEnum | BlogTagScalarFieldEnum[]
  }

  /**
   * BlogTag findFirstOrThrow
   */
  export type BlogTagFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogTag
     */
    select?: BlogTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogTag
     */
    omit?: BlogTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogTagInclude<ExtArgs> | null
    /**
     * Filter, which BlogTag to fetch.
     */
    where?: BlogTagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BlogTags to fetch.
     */
    orderBy?: BlogTagOrderByWithRelationInput | BlogTagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BlogTags.
     */
    cursor?: BlogTagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BlogTags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BlogTags.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BlogTags.
     */
    distinct?: BlogTagScalarFieldEnum | BlogTagScalarFieldEnum[]
  }

  /**
   * BlogTag findMany
   */
  export type BlogTagFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogTag
     */
    select?: BlogTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogTag
     */
    omit?: BlogTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogTagInclude<ExtArgs> | null
    /**
     * Filter, which BlogTags to fetch.
     */
    where?: BlogTagWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BlogTags to fetch.
     */
    orderBy?: BlogTagOrderByWithRelationInput | BlogTagOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing BlogTags.
     */
    cursor?: BlogTagWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BlogTags from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BlogTags.
     */
    skip?: number
    distinct?: BlogTagScalarFieldEnum | BlogTagScalarFieldEnum[]
  }

  /**
   * BlogTag create
   */
  export type BlogTagCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogTag
     */
    select?: BlogTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogTag
     */
    omit?: BlogTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogTagInclude<ExtArgs> | null
    /**
     * The data needed to create a BlogTag.
     */
    data: XOR<BlogTagCreateInput, BlogTagUncheckedCreateInput>
  }

  /**
   * BlogTag createMany
   */
  export type BlogTagCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many BlogTags.
     */
    data: BlogTagCreateManyInput | BlogTagCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * BlogTag createManyAndReturn
   */
  export type BlogTagCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogTag
     */
    select?: BlogTagSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the BlogTag
     */
    omit?: BlogTagOmit<ExtArgs> | null
    /**
     * The data used to create many BlogTags.
     */
    data: BlogTagCreateManyInput | BlogTagCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * BlogTag update
   */
  export type BlogTagUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogTag
     */
    select?: BlogTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogTag
     */
    omit?: BlogTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogTagInclude<ExtArgs> | null
    /**
     * The data needed to update a BlogTag.
     */
    data: XOR<BlogTagUpdateInput, BlogTagUncheckedUpdateInput>
    /**
     * Choose, which BlogTag to update.
     */
    where: BlogTagWhereUniqueInput
  }

  /**
   * BlogTag updateMany
   */
  export type BlogTagUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update BlogTags.
     */
    data: XOR<BlogTagUpdateManyMutationInput, BlogTagUncheckedUpdateManyInput>
    /**
     * Filter which BlogTags to update
     */
    where?: BlogTagWhereInput
    /**
     * Limit how many BlogTags to update.
     */
    limit?: number
  }

  /**
   * BlogTag updateManyAndReturn
   */
  export type BlogTagUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogTag
     */
    select?: BlogTagSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the BlogTag
     */
    omit?: BlogTagOmit<ExtArgs> | null
    /**
     * The data used to update BlogTags.
     */
    data: XOR<BlogTagUpdateManyMutationInput, BlogTagUncheckedUpdateManyInput>
    /**
     * Filter which BlogTags to update
     */
    where?: BlogTagWhereInput
    /**
     * Limit how many BlogTags to update.
     */
    limit?: number
  }

  /**
   * BlogTag upsert
   */
  export type BlogTagUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogTag
     */
    select?: BlogTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogTag
     */
    omit?: BlogTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogTagInclude<ExtArgs> | null
    /**
     * The filter to search for the BlogTag to update in case it exists.
     */
    where: BlogTagWhereUniqueInput
    /**
     * In case the BlogTag found by the `where` argument doesn't exist, create a new BlogTag with this data.
     */
    create: XOR<BlogTagCreateInput, BlogTagUncheckedCreateInput>
    /**
     * In case the BlogTag was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BlogTagUpdateInput, BlogTagUncheckedUpdateInput>
  }

  /**
   * BlogTag delete
   */
  export type BlogTagDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogTag
     */
    select?: BlogTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogTag
     */
    omit?: BlogTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogTagInclude<ExtArgs> | null
    /**
     * Filter which BlogTag to delete.
     */
    where: BlogTagWhereUniqueInput
  }

  /**
   * BlogTag deleteMany
   */
  export type BlogTagDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BlogTags to delete
     */
    where?: BlogTagWhereInput
    /**
     * Limit how many BlogTags to delete.
     */
    limit?: number
  }

  /**
   * BlogTag.posts
   */
  export type BlogTag$postsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogPost
     */
    select?: BlogPostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogPost
     */
    omit?: BlogPostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogPostInclude<ExtArgs> | null
    where?: BlogPostWhereInput
    orderBy?: BlogPostOrderByWithRelationInput | BlogPostOrderByWithRelationInput[]
    cursor?: BlogPostWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BlogPostScalarFieldEnum | BlogPostScalarFieldEnum[]
  }

  /**
   * BlogTag without action
   */
  export type BlogTagDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogTag
     */
    select?: BlogTagSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogTag
     */
    omit?: BlogTagOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogTagInclude<ExtArgs> | null
  }


  /**
   * Model BlogSeo
   */

  export type AggregateBlogSeo = {
    _count: BlogSeoCountAggregateOutputType | null
    _min: BlogSeoMinAggregateOutputType | null
    _max: BlogSeoMaxAggregateOutputType | null
  }

  export type BlogSeoMinAggregateOutputType = {
    id: string | null
    metaTitle: string | null
    metaDescription: string | null
    metaRobots: string | null
    keywords: string | null
    canonicalUrl: string | null
    ogTitle: string | null
    ogDescription: string | null
    ogImage: string | null
    ogUrl: string | null
    ogType: string | null
    ogSiteName: string | null
    twitterCardType: string | null
    twitterTitle: string | null
    twitterDescription: string | null
    twitterImage: string | null
    twitterSite: string | null
    blogpostingHeadline: string | null
    blogpostingDescription: string | null
    blogpostingAuthorName: string | null
    blogpostingAuthorUrl: string | null
    blogpostingPublisherName: string | null
    blogpostingPublisherLogo: string | null
    blogpostingKeywords: string | null
    blogpostingFeaturedImage: string | null
    mainEntityOfPage: string | null
    favicon: string | null
    language: string | null
    faqEnabled: boolean | null
    blogPostId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BlogSeoMaxAggregateOutputType = {
    id: string | null
    metaTitle: string | null
    metaDescription: string | null
    metaRobots: string | null
    keywords: string | null
    canonicalUrl: string | null
    ogTitle: string | null
    ogDescription: string | null
    ogImage: string | null
    ogUrl: string | null
    ogType: string | null
    ogSiteName: string | null
    twitterCardType: string | null
    twitterTitle: string | null
    twitterDescription: string | null
    twitterImage: string | null
    twitterSite: string | null
    blogpostingHeadline: string | null
    blogpostingDescription: string | null
    blogpostingAuthorName: string | null
    blogpostingAuthorUrl: string | null
    blogpostingPublisherName: string | null
    blogpostingPublisherLogo: string | null
    blogpostingKeywords: string | null
    blogpostingFeaturedImage: string | null
    mainEntityOfPage: string | null
    favicon: string | null
    language: string | null
    faqEnabled: boolean | null
    blogPostId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BlogSeoCountAggregateOutputType = {
    id: number
    metaTitle: number
    metaDescription: number
    metaRobots: number
    keywords: number
    canonicalUrl: number
    ogTitle: number
    ogDescription: number
    ogImage: number
    ogUrl: number
    ogType: number
    ogSiteName: number
    twitterCardType: number
    twitterTitle: number
    twitterDescription: number
    twitterImage: number
    twitterSite: number
    blogpostingHeadline: number
    blogpostingDescription: number
    blogpostingAuthorName: number
    blogpostingAuthorUrl: number
    blogpostingPublisherName: number
    blogpostingPublisherLogo: number
    blogpostingKeywords: number
    blogpostingFeaturedImage: number
    mainEntityOfPage: number
    favicon: number
    language: number
    faqEnabled: number
    faqData: number
    blogPostId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type BlogSeoMinAggregateInputType = {
    id?: true
    metaTitle?: true
    metaDescription?: true
    metaRobots?: true
    keywords?: true
    canonicalUrl?: true
    ogTitle?: true
    ogDescription?: true
    ogImage?: true
    ogUrl?: true
    ogType?: true
    ogSiteName?: true
    twitterCardType?: true
    twitterTitle?: true
    twitterDescription?: true
    twitterImage?: true
    twitterSite?: true
    blogpostingHeadline?: true
    blogpostingDescription?: true
    blogpostingAuthorName?: true
    blogpostingAuthorUrl?: true
    blogpostingPublisherName?: true
    blogpostingPublisherLogo?: true
    blogpostingKeywords?: true
    blogpostingFeaturedImage?: true
    mainEntityOfPage?: true
    favicon?: true
    language?: true
    faqEnabled?: true
    blogPostId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BlogSeoMaxAggregateInputType = {
    id?: true
    metaTitle?: true
    metaDescription?: true
    metaRobots?: true
    keywords?: true
    canonicalUrl?: true
    ogTitle?: true
    ogDescription?: true
    ogImage?: true
    ogUrl?: true
    ogType?: true
    ogSiteName?: true
    twitterCardType?: true
    twitterTitle?: true
    twitterDescription?: true
    twitterImage?: true
    twitterSite?: true
    blogpostingHeadline?: true
    blogpostingDescription?: true
    blogpostingAuthorName?: true
    blogpostingAuthorUrl?: true
    blogpostingPublisherName?: true
    blogpostingPublisherLogo?: true
    blogpostingKeywords?: true
    blogpostingFeaturedImage?: true
    mainEntityOfPage?: true
    favicon?: true
    language?: true
    faqEnabled?: true
    blogPostId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BlogSeoCountAggregateInputType = {
    id?: true
    metaTitle?: true
    metaDescription?: true
    metaRobots?: true
    keywords?: true
    canonicalUrl?: true
    ogTitle?: true
    ogDescription?: true
    ogImage?: true
    ogUrl?: true
    ogType?: true
    ogSiteName?: true
    twitterCardType?: true
    twitterTitle?: true
    twitterDescription?: true
    twitterImage?: true
    twitterSite?: true
    blogpostingHeadline?: true
    blogpostingDescription?: true
    blogpostingAuthorName?: true
    blogpostingAuthorUrl?: true
    blogpostingPublisherName?: true
    blogpostingPublisherLogo?: true
    blogpostingKeywords?: true
    blogpostingFeaturedImage?: true
    mainEntityOfPage?: true
    favicon?: true
    language?: true
    faqEnabled?: true
    faqData?: true
    blogPostId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type BlogSeoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BlogSeo to aggregate.
     */
    where?: BlogSeoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BlogSeos to fetch.
     */
    orderBy?: BlogSeoOrderByWithRelationInput | BlogSeoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BlogSeoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BlogSeos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BlogSeos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned BlogSeos
    **/
    _count?: true | BlogSeoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BlogSeoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BlogSeoMaxAggregateInputType
  }

  export type GetBlogSeoAggregateType<T extends BlogSeoAggregateArgs> = {
        [P in keyof T & keyof AggregateBlogSeo]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBlogSeo[P]>
      : GetScalarType<T[P], AggregateBlogSeo[P]>
  }




  export type BlogSeoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BlogSeoWhereInput
    orderBy?: BlogSeoOrderByWithAggregationInput | BlogSeoOrderByWithAggregationInput[]
    by: BlogSeoScalarFieldEnum[] | BlogSeoScalarFieldEnum
    having?: BlogSeoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BlogSeoCountAggregateInputType | true
    _min?: BlogSeoMinAggregateInputType
    _max?: BlogSeoMaxAggregateInputType
  }

  export type BlogSeoGroupByOutputType = {
    id: string
    metaTitle: string | null
    metaDescription: string | null
    metaRobots: string | null
    keywords: string | null
    canonicalUrl: string | null
    ogTitle: string | null
    ogDescription: string | null
    ogImage: string | null
    ogUrl: string | null
    ogType: string | null
    ogSiteName: string | null
    twitterCardType: string | null
    twitterTitle: string | null
    twitterDescription: string | null
    twitterImage: string | null
    twitterSite: string | null
    blogpostingHeadline: string | null
    blogpostingDescription: string | null
    blogpostingAuthorName: string | null
    blogpostingAuthorUrl: string | null
    blogpostingPublisherName: string | null
    blogpostingPublisherLogo: string | null
    blogpostingKeywords: string | null
    blogpostingFeaturedImage: string | null
    mainEntityOfPage: string | null
    favicon: string | null
    language: string | null
    faqEnabled: boolean
    faqData: JsonValue | null
    blogPostId: string
    createdAt: Date
    updatedAt: Date
    _count: BlogSeoCountAggregateOutputType | null
    _min: BlogSeoMinAggregateOutputType | null
    _max: BlogSeoMaxAggregateOutputType | null
  }

  type GetBlogSeoGroupByPayload<T extends BlogSeoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BlogSeoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BlogSeoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BlogSeoGroupByOutputType[P]>
            : GetScalarType<T[P], BlogSeoGroupByOutputType[P]>
        }
      >
    >


  export type BlogSeoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    metaTitle?: boolean
    metaDescription?: boolean
    metaRobots?: boolean
    keywords?: boolean
    canonicalUrl?: boolean
    ogTitle?: boolean
    ogDescription?: boolean
    ogImage?: boolean
    ogUrl?: boolean
    ogType?: boolean
    ogSiteName?: boolean
    twitterCardType?: boolean
    twitterTitle?: boolean
    twitterDescription?: boolean
    twitterImage?: boolean
    twitterSite?: boolean
    blogpostingHeadline?: boolean
    blogpostingDescription?: boolean
    blogpostingAuthorName?: boolean
    blogpostingAuthorUrl?: boolean
    blogpostingPublisherName?: boolean
    blogpostingPublisherLogo?: boolean
    blogpostingKeywords?: boolean
    blogpostingFeaturedImage?: boolean
    mainEntityOfPage?: boolean
    favicon?: boolean
    language?: boolean
    faqEnabled?: boolean
    faqData?: boolean
    blogPostId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    blogPost?: boolean | BlogPostDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["blogSeo"]>

  export type BlogSeoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    metaTitle?: boolean
    metaDescription?: boolean
    metaRobots?: boolean
    keywords?: boolean
    canonicalUrl?: boolean
    ogTitle?: boolean
    ogDescription?: boolean
    ogImage?: boolean
    ogUrl?: boolean
    ogType?: boolean
    ogSiteName?: boolean
    twitterCardType?: boolean
    twitterTitle?: boolean
    twitterDescription?: boolean
    twitterImage?: boolean
    twitterSite?: boolean
    blogpostingHeadline?: boolean
    blogpostingDescription?: boolean
    blogpostingAuthorName?: boolean
    blogpostingAuthorUrl?: boolean
    blogpostingPublisherName?: boolean
    blogpostingPublisherLogo?: boolean
    blogpostingKeywords?: boolean
    blogpostingFeaturedImage?: boolean
    mainEntityOfPage?: boolean
    favicon?: boolean
    language?: boolean
    faqEnabled?: boolean
    faqData?: boolean
    blogPostId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    blogPost?: boolean | BlogPostDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["blogSeo"]>

  export type BlogSeoSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    metaTitle?: boolean
    metaDescription?: boolean
    metaRobots?: boolean
    keywords?: boolean
    canonicalUrl?: boolean
    ogTitle?: boolean
    ogDescription?: boolean
    ogImage?: boolean
    ogUrl?: boolean
    ogType?: boolean
    ogSiteName?: boolean
    twitterCardType?: boolean
    twitterTitle?: boolean
    twitterDescription?: boolean
    twitterImage?: boolean
    twitterSite?: boolean
    blogpostingHeadline?: boolean
    blogpostingDescription?: boolean
    blogpostingAuthorName?: boolean
    blogpostingAuthorUrl?: boolean
    blogpostingPublisherName?: boolean
    blogpostingPublisherLogo?: boolean
    blogpostingKeywords?: boolean
    blogpostingFeaturedImage?: boolean
    mainEntityOfPage?: boolean
    favicon?: boolean
    language?: boolean
    faqEnabled?: boolean
    faqData?: boolean
    blogPostId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    blogPost?: boolean | BlogPostDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["blogSeo"]>

  export type BlogSeoSelectScalar = {
    id?: boolean
    metaTitle?: boolean
    metaDescription?: boolean
    metaRobots?: boolean
    keywords?: boolean
    canonicalUrl?: boolean
    ogTitle?: boolean
    ogDescription?: boolean
    ogImage?: boolean
    ogUrl?: boolean
    ogType?: boolean
    ogSiteName?: boolean
    twitterCardType?: boolean
    twitterTitle?: boolean
    twitterDescription?: boolean
    twitterImage?: boolean
    twitterSite?: boolean
    blogpostingHeadline?: boolean
    blogpostingDescription?: boolean
    blogpostingAuthorName?: boolean
    blogpostingAuthorUrl?: boolean
    blogpostingPublisherName?: boolean
    blogpostingPublisherLogo?: boolean
    blogpostingKeywords?: boolean
    blogpostingFeaturedImage?: boolean
    mainEntityOfPage?: boolean
    favicon?: boolean
    language?: boolean
    faqEnabled?: boolean
    faqData?: boolean
    blogPostId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type BlogSeoOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "metaTitle" | "metaDescription" | "metaRobots" | "keywords" | "canonicalUrl" | "ogTitle" | "ogDescription" | "ogImage" | "ogUrl" | "ogType" | "ogSiteName" | "twitterCardType" | "twitterTitle" | "twitterDescription" | "twitterImage" | "twitterSite" | "blogpostingHeadline" | "blogpostingDescription" | "blogpostingAuthorName" | "blogpostingAuthorUrl" | "blogpostingPublisherName" | "blogpostingPublisherLogo" | "blogpostingKeywords" | "blogpostingFeaturedImage" | "mainEntityOfPage" | "favicon" | "language" | "faqEnabled" | "faqData" | "blogPostId" | "createdAt" | "updatedAt", ExtArgs["result"]["blogSeo"]>
  export type BlogSeoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    blogPost?: boolean | BlogPostDefaultArgs<ExtArgs>
  }
  export type BlogSeoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    blogPost?: boolean | BlogPostDefaultArgs<ExtArgs>
  }
  export type BlogSeoIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    blogPost?: boolean | BlogPostDefaultArgs<ExtArgs>
  }

  export type $BlogSeoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "BlogSeo"
    objects: {
      blogPost: Prisma.$BlogPostPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      metaTitle: string | null
      metaDescription: string | null
      metaRobots: string | null
      keywords: string | null
      canonicalUrl: string | null
      ogTitle: string | null
      ogDescription: string | null
      ogImage: string | null
      ogUrl: string | null
      ogType: string | null
      ogSiteName: string | null
      twitterCardType: string | null
      twitterTitle: string | null
      twitterDescription: string | null
      twitterImage: string | null
      twitterSite: string | null
      blogpostingHeadline: string | null
      blogpostingDescription: string | null
      blogpostingAuthorName: string | null
      blogpostingAuthorUrl: string | null
      blogpostingPublisherName: string | null
      blogpostingPublisherLogo: string | null
      blogpostingKeywords: string | null
      blogpostingFeaturedImage: string | null
      mainEntityOfPage: string | null
      favicon: string | null
      language: string | null
      faqEnabled: boolean
      faqData: Prisma.JsonValue | null
      blogPostId: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["blogSeo"]>
    composites: {}
  }

  type BlogSeoGetPayload<S extends boolean | null | undefined | BlogSeoDefaultArgs> = $Result.GetResult<Prisma.$BlogSeoPayload, S>

  type BlogSeoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<BlogSeoFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: BlogSeoCountAggregateInputType | true
    }

  export interface BlogSeoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['BlogSeo'], meta: { name: 'BlogSeo' } }
    /**
     * Find zero or one BlogSeo that matches the filter.
     * @param {BlogSeoFindUniqueArgs} args - Arguments to find a BlogSeo
     * @example
     * // Get one BlogSeo
     * const blogSeo = await prisma.blogSeo.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BlogSeoFindUniqueArgs>(args: SelectSubset<T, BlogSeoFindUniqueArgs<ExtArgs>>): Prisma__BlogSeoClient<$Result.GetResult<Prisma.$BlogSeoPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one BlogSeo that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {BlogSeoFindUniqueOrThrowArgs} args - Arguments to find a BlogSeo
     * @example
     * // Get one BlogSeo
     * const blogSeo = await prisma.blogSeo.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BlogSeoFindUniqueOrThrowArgs>(args: SelectSubset<T, BlogSeoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BlogSeoClient<$Result.GetResult<Prisma.$BlogSeoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first BlogSeo that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BlogSeoFindFirstArgs} args - Arguments to find a BlogSeo
     * @example
     * // Get one BlogSeo
     * const blogSeo = await prisma.blogSeo.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BlogSeoFindFirstArgs>(args?: SelectSubset<T, BlogSeoFindFirstArgs<ExtArgs>>): Prisma__BlogSeoClient<$Result.GetResult<Prisma.$BlogSeoPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first BlogSeo that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BlogSeoFindFirstOrThrowArgs} args - Arguments to find a BlogSeo
     * @example
     * // Get one BlogSeo
     * const blogSeo = await prisma.blogSeo.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BlogSeoFindFirstOrThrowArgs>(args?: SelectSubset<T, BlogSeoFindFirstOrThrowArgs<ExtArgs>>): Prisma__BlogSeoClient<$Result.GetResult<Prisma.$BlogSeoPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more BlogSeos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BlogSeoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all BlogSeos
     * const blogSeos = await prisma.blogSeo.findMany()
     * 
     * // Get first 10 BlogSeos
     * const blogSeos = await prisma.blogSeo.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const blogSeoWithIdOnly = await prisma.blogSeo.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BlogSeoFindManyArgs>(args?: SelectSubset<T, BlogSeoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BlogSeoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a BlogSeo.
     * @param {BlogSeoCreateArgs} args - Arguments to create a BlogSeo.
     * @example
     * // Create one BlogSeo
     * const BlogSeo = await prisma.blogSeo.create({
     *   data: {
     *     // ... data to create a BlogSeo
     *   }
     * })
     * 
     */
    create<T extends BlogSeoCreateArgs>(args: SelectSubset<T, BlogSeoCreateArgs<ExtArgs>>): Prisma__BlogSeoClient<$Result.GetResult<Prisma.$BlogSeoPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many BlogSeos.
     * @param {BlogSeoCreateManyArgs} args - Arguments to create many BlogSeos.
     * @example
     * // Create many BlogSeos
     * const blogSeo = await prisma.blogSeo.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BlogSeoCreateManyArgs>(args?: SelectSubset<T, BlogSeoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many BlogSeos and returns the data saved in the database.
     * @param {BlogSeoCreateManyAndReturnArgs} args - Arguments to create many BlogSeos.
     * @example
     * // Create many BlogSeos
     * const blogSeo = await prisma.blogSeo.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many BlogSeos and only return the `id`
     * const blogSeoWithIdOnly = await prisma.blogSeo.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends BlogSeoCreateManyAndReturnArgs>(args?: SelectSubset<T, BlogSeoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BlogSeoPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a BlogSeo.
     * @param {BlogSeoDeleteArgs} args - Arguments to delete one BlogSeo.
     * @example
     * // Delete one BlogSeo
     * const BlogSeo = await prisma.blogSeo.delete({
     *   where: {
     *     // ... filter to delete one BlogSeo
     *   }
     * })
     * 
     */
    delete<T extends BlogSeoDeleteArgs>(args: SelectSubset<T, BlogSeoDeleteArgs<ExtArgs>>): Prisma__BlogSeoClient<$Result.GetResult<Prisma.$BlogSeoPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one BlogSeo.
     * @param {BlogSeoUpdateArgs} args - Arguments to update one BlogSeo.
     * @example
     * // Update one BlogSeo
     * const blogSeo = await prisma.blogSeo.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BlogSeoUpdateArgs>(args: SelectSubset<T, BlogSeoUpdateArgs<ExtArgs>>): Prisma__BlogSeoClient<$Result.GetResult<Prisma.$BlogSeoPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more BlogSeos.
     * @param {BlogSeoDeleteManyArgs} args - Arguments to filter BlogSeos to delete.
     * @example
     * // Delete a few BlogSeos
     * const { count } = await prisma.blogSeo.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BlogSeoDeleteManyArgs>(args?: SelectSubset<T, BlogSeoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BlogSeos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BlogSeoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many BlogSeos
     * const blogSeo = await prisma.blogSeo.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BlogSeoUpdateManyArgs>(args: SelectSubset<T, BlogSeoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BlogSeos and returns the data updated in the database.
     * @param {BlogSeoUpdateManyAndReturnArgs} args - Arguments to update many BlogSeos.
     * @example
     * // Update many BlogSeos
     * const blogSeo = await prisma.blogSeo.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more BlogSeos and only return the `id`
     * const blogSeoWithIdOnly = await prisma.blogSeo.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends BlogSeoUpdateManyAndReturnArgs>(args: SelectSubset<T, BlogSeoUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BlogSeoPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one BlogSeo.
     * @param {BlogSeoUpsertArgs} args - Arguments to update or create a BlogSeo.
     * @example
     * // Update or create a BlogSeo
     * const blogSeo = await prisma.blogSeo.upsert({
     *   create: {
     *     // ... data to create a BlogSeo
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the BlogSeo we want to update
     *   }
     * })
     */
    upsert<T extends BlogSeoUpsertArgs>(args: SelectSubset<T, BlogSeoUpsertArgs<ExtArgs>>): Prisma__BlogSeoClient<$Result.GetResult<Prisma.$BlogSeoPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of BlogSeos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BlogSeoCountArgs} args - Arguments to filter BlogSeos to count.
     * @example
     * // Count the number of BlogSeos
     * const count = await prisma.blogSeo.count({
     *   where: {
     *     // ... the filter for the BlogSeos we want to count
     *   }
     * })
    **/
    count<T extends BlogSeoCountArgs>(
      args?: Subset<T, BlogSeoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BlogSeoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a BlogSeo.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BlogSeoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BlogSeoAggregateArgs>(args: Subset<T, BlogSeoAggregateArgs>): Prisma.PrismaPromise<GetBlogSeoAggregateType<T>>

    /**
     * Group by BlogSeo.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BlogSeoGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends BlogSeoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BlogSeoGroupByArgs['orderBy'] }
        : { orderBy?: BlogSeoGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, BlogSeoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBlogSeoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the BlogSeo model
   */
  readonly fields: BlogSeoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for BlogSeo.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BlogSeoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    blogPost<T extends BlogPostDefaultArgs<ExtArgs> = {}>(args?: Subset<T, BlogPostDefaultArgs<ExtArgs>>): Prisma__BlogPostClient<$Result.GetResult<Prisma.$BlogPostPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the BlogSeo model
   */
  interface BlogSeoFieldRefs {
    readonly id: FieldRef<"BlogSeo", 'String'>
    readonly metaTitle: FieldRef<"BlogSeo", 'String'>
    readonly metaDescription: FieldRef<"BlogSeo", 'String'>
    readonly metaRobots: FieldRef<"BlogSeo", 'String'>
    readonly keywords: FieldRef<"BlogSeo", 'String'>
    readonly canonicalUrl: FieldRef<"BlogSeo", 'String'>
    readonly ogTitle: FieldRef<"BlogSeo", 'String'>
    readonly ogDescription: FieldRef<"BlogSeo", 'String'>
    readonly ogImage: FieldRef<"BlogSeo", 'String'>
    readonly ogUrl: FieldRef<"BlogSeo", 'String'>
    readonly ogType: FieldRef<"BlogSeo", 'String'>
    readonly ogSiteName: FieldRef<"BlogSeo", 'String'>
    readonly twitterCardType: FieldRef<"BlogSeo", 'String'>
    readonly twitterTitle: FieldRef<"BlogSeo", 'String'>
    readonly twitterDescription: FieldRef<"BlogSeo", 'String'>
    readonly twitterImage: FieldRef<"BlogSeo", 'String'>
    readonly twitterSite: FieldRef<"BlogSeo", 'String'>
    readonly blogpostingHeadline: FieldRef<"BlogSeo", 'String'>
    readonly blogpostingDescription: FieldRef<"BlogSeo", 'String'>
    readonly blogpostingAuthorName: FieldRef<"BlogSeo", 'String'>
    readonly blogpostingAuthorUrl: FieldRef<"BlogSeo", 'String'>
    readonly blogpostingPublisherName: FieldRef<"BlogSeo", 'String'>
    readonly blogpostingPublisherLogo: FieldRef<"BlogSeo", 'String'>
    readonly blogpostingKeywords: FieldRef<"BlogSeo", 'String'>
    readonly blogpostingFeaturedImage: FieldRef<"BlogSeo", 'String'>
    readonly mainEntityOfPage: FieldRef<"BlogSeo", 'String'>
    readonly favicon: FieldRef<"BlogSeo", 'String'>
    readonly language: FieldRef<"BlogSeo", 'String'>
    readonly faqEnabled: FieldRef<"BlogSeo", 'Boolean'>
    readonly faqData: FieldRef<"BlogSeo", 'Json'>
    readonly blogPostId: FieldRef<"BlogSeo", 'String'>
    readonly createdAt: FieldRef<"BlogSeo", 'DateTime'>
    readonly updatedAt: FieldRef<"BlogSeo", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * BlogSeo findUnique
   */
  export type BlogSeoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogSeo
     */
    select?: BlogSeoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogSeo
     */
    omit?: BlogSeoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogSeoInclude<ExtArgs> | null
    /**
     * Filter, which BlogSeo to fetch.
     */
    where: BlogSeoWhereUniqueInput
  }

  /**
   * BlogSeo findUniqueOrThrow
   */
  export type BlogSeoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogSeo
     */
    select?: BlogSeoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogSeo
     */
    omit?: BlogSeoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogSeoInclude<ExtArgs> | null
    /**
     * Filter, which BlogSeo to fetch.
     */
    where: BlogSeoWhereUniqueInput
  }

  /**
   * BlogSeo findFirst
   */
  export type BlogSeoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogSeo
     */
    select?: BlogSeoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogSeo
     */
    omit?: BlogSeoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogSeoInclude<ExtArgs> | null
    /**
     * Filter, which BlogSeo to fetch.
     */
    where?: BlogSeoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BlogSeos to fetch.
     */
    orderBy?: BlogSeoOrderByWithRelationInput | BlogSeoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BlogSeos.
     */
    cursor?: BlogSeoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BlogSeos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BlogSeos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BlogSeos.
     */
    distinct?: BlogSeoScalarFieldEnum | BlogSeoScalarFieldEnum[]
  }

  /**
   * BlogSeo findFirstOrThrow
   */
  export type BlogSeoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogSeo
     */
    select?: BlogSeoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogSeo
     */
    omit?: BlogSeoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogSeoInclude<ExtArgs> | null
    /**
     * Filter, which BlogSeo to fetch.
     */
    where?: BlogSeoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BlogSeos to fetch.
     */
    orderBy?: BlogSeoOrderByWithRelationInput | BlogSeoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BlogSeos.
     */
    cursor?: BlogSeoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BlogSeos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BlogSeos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BlogSeos.
     */
    distinct?: BlogSeoScalarFieldEnum | BlogSeoScalarFieldEnum[]
  }

  /**
   * BlogSeo findMany
   */
  export type BlogSeoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogSeo
     */
    select?: BlogSeoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogSeo
     */
    omit?: BlogSeoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogSeoInclude<ExtArgs> | null
    /**
     * Filter, which BlogSeos to fetch.
     */
    where?: BlogSeoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BlogSeos to fetch.
     */
    orderBy?: BlogSeoOrderByWithRelationInput | BlogSeoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing BlogSeos.
     */
    cursor?: BlogSeoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BlogSeos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BlogSeos.
     */
    skip?: number
    distinct?: BlogSeoScalarFieldEnum | BlogSeoScalarFieldEnum[]
  }

  /**
   * BlogSeo create
   */
  export type BlogSeoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogSeo
     */
    select?: BlogSeoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogSeo
     */
    omit?: BlogSeoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogSeoInclude<ExtArgs> | null
    /**
     * The data needed to create a BlogSeo.
     */
    data: XOR<BlogSeoCreateInput, BlogSeoUncheckedCreateInput>
  }

  /**
   * BlogSeo createMany
   */
  export type BlogSeoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many BlogSeos.
     */
    data: BlogSeoCreateManyInput | BlogSeoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * BlogSeo createManyAndReturn
   */
  export type BlogSeoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogSeo
     */
    select?: BlogSeoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the BlogSeo
     */
    omit?: BlogSeoOmit<ExtArgs> | null
    /**
     * The data used to create many BlogSeos.
     */
    data: BlogSeoCreateManyInput | BlogSeoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogSeoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * BlogSeo update
   */
  export type BlogSeoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogSeo
     */
    select?: BlogSeoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogSeo
     */
    omit?: BlogSeoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogSeoInclude<ExtArgs> | null
    /**
     * The data needed to update a BlogSeo.
     */
    data: XOR<BlogSeoUpdateInput, BlogSeoUncheckedUpdateInput>
    /**
     * Choose, which BlogSeo to update.
     */
    where: BlogSeoWhereUniqueInput
  }

  /**
   * BlogSeo updateMany
   */
  export type BlogSeoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update BlogSeos.
     */
    data: XOR<BlogSeoUpdateManyMutationInput, BlogSeoUncheckedUpdateManyInput>
    /**
     * Filter which BlogSeos to update
     */
    where?: BlogSeoWhereInput
    /**
     * Limit how many BlogSeos to update.
     */
    limit?: number
  }

  /**
   * BlogSeo updateManyAndReturn
   */
  export type BlogSeoUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogSeo
     */
    select?: BlogSeoSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the BlogSeo
     */
    omit?: BlogSeoOmit<ExtArgs> | null
    /**
     * The data used to update BlogSeos.
     */
    data: XOR<BlogSeoUpdateManyMutationInput, BlogSeoUncheckedUpdateManyInput>
    /**
     * Filter which BlogSeos to update
     */
    where?: BlogSeoWhereInput
    /**
     * Limit how many BlogSeos to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogSeoIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * BlogSeo upsert
   */
  export type BlogSeoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogSeo
     */
    select?: BlogSeoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogSeo
     */
    omit?: BlogSeoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogSeoInclude<ExtArgs> | null
    /**
     * The filter to search for the BlogSeo to update in case it exists.
     */
    where: BlogSeoWhereUniqueInput
    /**
     * In case the BlogSeo found by the `where` argument doesn't exist, create a new BlogSeo with this data.
     */
    create: XOR<BlogSeoCreateInput, BlogSeoUncheckedCreateInput>
    /**
     * In case the BlogSeo was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BlogSeoUpdateInput, BlogSeoUncheckedUpdateInput>
  }

  /**
   * BlogSeo delete
   */
  export type BlogSeoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogSeo
     */
    select?: BlogSeoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogSeo
     */
    omit?: BlogSeoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogSeoInclude<ExtArgs> | null
    /**
     * Filter which BlogSeo to delete.
     */
    where: BlogSeoWhereUniqueInput
  }

  /**
   * BlogSeo deleteMany
   */
  export type BlogSeoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BlogSeos to delete
     */
    where?: BlogSeoWhereInput
    /**
     * Limit how many BlogSeos to delete.
     */
    limit?: number
  }

  /**
   * BlogSeo without action
   */
  export type BlogSeoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BlogSeo
     */
    select?: BlogSeoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BlogSeo
     */
    omit?: BlogSeoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BlogSeoInclude<ExtArgs> | null
  }


  /**
   * Model OnboardingTagVersion
   */

  export type AggregateOnboardingTagVersion = {
    _count: OnboardingTagVersionCountAggregateOutputType | null
    _min: OnboardingTagVersionMinAggregateOutputType | null
    _max: OnboardingTagVersionMaxAggregateOutputType | null
  }

  export type OnboardingTagVersionMinAggregateOutputType = {
    id: string | null
    tag: string | null
    title: string | null
    description: string | null
    status: $Enums.TagStatus | null
    createdAt: Date | null
    publishedAt: Date | null
  }

  export type OnboardingTagVersionMaxAggregateOutputType = {
    id: string | null
    tag: string | null
    title: string | null
    description: string | null
    status: $Enums.TagStatus | null
    createdAt: Date | null
    publishedAt: Date | null
  }

  export type OnboardingTagVersionCountAggregateOutputType = {
    id: number
    tag: number
    title: number
    description: number
    status: number
    createdAt: number
    publishedAt: number
    _all: number
  }


  export type OnboardingTagVersionMinAggregateInputType = {
    id?: true
    tag?: true
    title?: true
    description?: true
    status?: true
    createdAt?: true
    publishedAt?: true
  }

  export type OnboardingTagVersionMaxAggregateInputType = {
    id?: true
    tag?: true
    title?: true
    description?: true
    status?: true
    createdAt?: true
    publishedAt?: true
  }

  export type OnboardingTagVersionCountAggregateInputType = {
    id?: true
    tag?: true
    title?: true
    description?: true
    status?: true
    createdAt?: true
    publishedAt?: true
    _all?: true
  }

  export type OnboardingTagVersionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OnboardingTagVersion to aggregate.
     */
    where?: OnboardingTagVersionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OnboardingTagVersions to fetch.
     */
    orderBy?: OnboardingTagVersionOrderByWithRelationInput | OnboardingTagVersionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OnboardingTagVersionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OnboardingTagVersions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OnboardingTagVersions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OnboardingTagVersions
    **/
    _count?: true | OnboardingTagVersionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OnboardingTagVersionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OnboardingTagVersionMaxAggregateInputType
  }

  export type GetOnboardingTagVersionAggregateType<T extends OnboardingTagVersionAggregateArgs> = {
        [P in keyof T & keyof AggregateOnboardingTagVersion]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOnboardingTagVersion[P]>
      : GetScalarType<T[P], AggregateOnboardingTagVersion[P]>
  }




  export type OnboardingTagVersionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OnboardingTagVersionWhereInput
    orderBy?: OnboardingTagVersionOrderByWithAggregationInput | OnboardingTagVersionOrderByWithAggregationInput[]
    by: OnboardingTagVersionScalarFieldEnum[] | OnboardingTagVersionScalarFieldEnum
    having?: OnboardingTagVersionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OnboardingTagVersionCountAggregateInputType | true
    _min?: OnboardingTagVersionMinAggregateInputType
    _max?: OnboardingTagVersionMaxAggregateInputType
  }

  export type OnboardingTagVersionGroupByOutputType = {
    id: string
    tag: string
    title: string
    description: string | null
    status: $Enums.TagStatus
    createdAt: Date
    publishedAt: Date | null
    _count: OnboardingTagVersionCountAggregateOutputType | null
    _min: OnboardingTagVersionMinAggregateOutputType | null
    _max: OnboardingTagVersionMaxAggregateOutputType | null
  }

  type GetOnboardingTagVersionGroupByPayload<T extends OnboardingTagVersionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OnboardingTagVersionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OnboardingTagVersionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OnboardingTagVersionGroupByOutputType[P]>
            : GetScalarType<T[P], OnboardingTagVersionGroupByOutputType[P]>
        }
      >
    >


  export type OnboardingTagVersionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tag?: boolean
    title?: boolean
    description?: boolean
    status?: boolean
    createdAt?: boolean
    publishedAt?: boolean
    questions?: boolean | OnboardingTagVersion$questionsArgs<ExtArgs>
    responses?: boolean | OnboardingTagVersion$responsesArgs<ExtArgs>
    _count?: boolean | OnboardingTagVersionCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["onboardingTagVersion"]>

  export type OnboardingTagVersionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tag?: boolean
    title?: boolean
    description?: boolean
    status?: boolean
    createdAt?: boolean
    publishedAt?: boolean
  }, ExtArgs["result"]["onboardingTagVersion"]>

  export type OnboardingTagVersionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tag?: boolean
    title?: boolean
    description?: boolean
    status?: boolean
    createdAt?: boolean
    publishedAt?: boolean
  }, ExtArgs["result"]["onboardingTagVersion"]>

  export type OnboardingTagVersionSelectScalar = {
    id?: boolean
    tag?: boolean
    title?: boolean
    description?: boolean
    status?: boolean
    createdAt?: boolean
    publishedAt?: boolean
  }

  export type OnboardingTagVersionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tag" | "title" | "description" | "status" | "createdAt" | "publishedAt", ExtArgs["result"]["onboardingTagVersion"]>
  export type OnboardingTagVersionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    questions?: boolean | OnboardingTagVersion$questionsArgs<ExtArgs>
    responses?: boolean | OnboardingTagVersion$responsesArgs<ExtArgs>
    _count?: boolean | OnboardingTagVersionCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type OnboardingTagVersionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type OnboardingTagVersionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $OnboardingTagVersionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OnboardingTagVersion"
    objects: {
      questions: Prisma.$OnboardingQuestionPayload<ExtArgs>[]
      responses: Prisma.$OnboardingResponsePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tag: string
      title: string
      description: string | null
      status: $Enums.TagStatus
      createdAt: Date
      publishedAt: Date | null
    }, ExtArgs["result"]["onboardingTagVersion"]>
    composites: {}
  }

  type OnboardingTagVersionGetPayload<S extends boolean | null | undefined | OnboardingTagVersionDefaultArgs> = $Result.GetResult<Prisma.$OnboardingTagVersionPayload, S>

  type OnboardingTagVersionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OnboardingTagVersionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OnboardingTagVersionCountAggregateInputType | true
    }

  export interface OnboardingTagVersionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OnboardingTagVersion'], meta: { name: 'OnboardingTagVersion' } }
    /**
     * Find zero or one OnboardingTagVersion that matches the filter.
     * @param {OnboardingTagVersionFindUniqueArgs} args - Arguments to find a OnboardingTagVersion
     * @example
     * // Get one OnboardingTagVersion
     * const onboardingTagVersion = await prisma.onboardingTagVersion.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OnboardingTagVersionFindUniqueArgs>(args: SelectSubset<T, OnboardingTagVersionFindUniqueArgs<ExtArgs>>): Prisma__OnboardingTagVersionClient<$Result.GetResult<Prisma.$OnboardingTagVersionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one OnboardingTagVersion that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OnboardingTagVersionFindUniqueOrThrowArgs} args - Arguments to find a OnboardingTagVersion
     * @example
     * // Get one OnboardingTagVersion
     * const onboardingTagVersion = await prisma.onboardingTagVersion.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OnboardingTagVersionFindUniqueOrThrowArgs>(args: SelectSubset<T, OnboardingTagVersionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OnboardingTagVersionClient<$Result.GetResult<Prisma.$OnboardingTagVersionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OnboardingTagVersion that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingTagVersionFindFirstArgs} args - Arguments to find a OnboardingTagVersion
     * @example
     * // Get one OnboardingTagVersion
     * const onboardingTagVersion = await prisma.onboardingTagVersion.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OnboardingTagVersionFindFirstArgs>(args?: SelectSubset<T, OnboardingTagVersionFindFirstArgs<ExtArgs>>): Prisma__OnboardingTagVersionClient<$Result.GetResult<Prisma.$OnboardingTagVersionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OnboardingTagVersion that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingTagVersionFindFirstOrThrowArgs} args - Arguments to find a OnboardingTagVersion
     * @example
     * // Get one OnboardingTagVersion
     * const onboardingTagVersion = await prisma.onboardingTagVersion.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OnboardingTagVersionFindFirstOrThrowArgs>(args?: SelectSubset<T, OnboardingTagVersionFindFirstOrThrowArgs<ExtArgs>>): Prisma__OnboardingTagVersionClient<$Result.GetResult<Prisma.$OnboardingTagVersionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more OnboardingTagVersions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingTagVersionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OnboardingTagVersions
     * const onboardingTagVersions = await prisma.onboardingTagVersion.findMany()
     * 
     * // Get first 10 OnboardingTagVersions
     * const onboardingTagVersions = await prisma.onboardingTagVersion.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const onboardingTagVersionWithIdOnly = await prisma.onboardingTagVersion.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OnboardingTagVersionFindManyArgs>(args?: SelectSubset<T, OnboardingTagVersionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OnboardingTagVersionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a OnboardingTagVersion.
     * @param {OnboardingTagVersionCreateArgs} args - Arguments to create a OnboardingTagVersion.
     * @example
     * // Create one OnboardingTagVersion
     * const OnboardingTagVersion = await prisma.onboardingTagVersion.create({
     *   data: {
     *     // ... data to create a OnboardingTagVersion
     *   }
     * })
     * 
     */
    create<T extends OnboardingTagVersionCreateArgs>(args: SelectSubset<T, OnboardingTagVersionCreateArgs<ExtArgs>>): Prisma__OnboardingTagVersionClient<$Result.GetResult<Prisma.$OnboardingTagVersionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many OnboardingTagVersions.
     * @param {OnboardingTagVersionCreateManyArgs} args - Arguments to create many OnboardingTagVersions.
     * @example
     * // Create many OnboardingTagVersions
     * const onboardingTagVersion = await prisma.onboardingTagVersion.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OnboardingTagVersionCreateManyArgs>(args?: SelectSubset<T, OnboardingTagVersionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many OnboardingTagVersions and returns the data saved in the database.
     * @param {OnboardingTagVersionCreateManyAndReturnArgs} args - Arguments to create many OnboardingTagVersions.
     * @example
     * // Create many OnboardingTagVersions
     * const onboardingTagVersion = await prisma.onboardingTagVersion.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many OnboardingTagVersions and only return the `id`
     * const onboardingTagVersionWithIdOnly = await prisma.onboardingTagVersion.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OnboardingTagVersionCreateManyAndReturnArgs>(args?: SelectSubset<T, OnboardingTagVersionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OnboardingTagVersionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a OnboardingTagVersion.
     * @param {OnboardingTagVersionDeleteArgs} args - Arguments to delete one OnboardingTagVersion.
     * @example
     * // Delete one OnboardingTagVersion
     * const OnboardingTagVersion = await prisma.onboardingTagVersion.delete({
     *   where: {
     *     // ... filter to delete one OnboardingTagVersion
     *   }
     * })
     * 
     */
    delete<T extends OnboardingTagVersionDeleteArgs>(args: SelectSubset<T, OnboardingTagVersionDeleteArgs<ExtArgs>>): Prisma__OnboardingTagVersionClient<$Result.GetResult<Prisma.$OnboardingTagVersionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one OnboardingTagVersion.
     * @param {OnboardingTagVersionUpdateArgs} args - Arguments to update one OnboardingTagVersion.
     * @example
     * // Update one OnboardingTagVersion
     * const onboardingTagVersion = await prisma.onboardingTagVersion.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OnboardingTagVersionUpdateArgs>(args: SelectSubset<T, OnboardingTagVersionUpdateArgs<ExtArgs>>): Prisma__OnboardingTagVersionClient<$Result.GetResult<Prisma.$OnboardingTagVersionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more OnboardingTagVersions.
     * @param {OnboardingTagVersionDeleteManyArgs} args - Arguments to filter OnboardingTagVersions to delete.
     * @example
     * // Delete a few OnboardingTagVersions
     * const { count } = await prisma.onboardingTagVersion.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OnboardingTagVersionDeleteManyArgs>(args?: SelectSubset<T, OnboardingTagVersionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OnboardingTagVersions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingTagVersionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OnboardingTagVersions
     * const onboardingTagVersion = await prisma.onboardingTagVersion.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OnboardingTagVersionUpdateManyArgs>(args: SelectSubset<T, OnboardingTagVersionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OnboardingTagVersions and returns the data updated in the database.
     * @param {OnboardingTagVersionUpdateManyAndReturnArgs} args - Arguments to update many OnboardingTagVersions.
     * @example
     * // Update many OnboardingTagVersions
     * const onboardingTagVersion = await prisma.onboardingTagVersion.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more OnboardingTagVersions and only return the `id`
     * const onboardingTagVersionWithIdOnly = await prisma.onboardingTagVersion.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends OnboardingTagVersionUpdateManyAndReturnArgs>(args: SelectSubset<T, OnboardingTagVersionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OnboardingTagVersionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one OnboardingTagVersion.
     * @param {OnboardingTagVersionUpsertArgs} args - Arguments to update or create a OnboardingTagVersion.
     * @example
     * // Update or create a OnboardingTagVersion
     * const onboardingTagVersion = await prisma.onboardingTagVersion.upsert({
     *   create: {
     *     // ... data to create a OnboardingTagVersion
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OnboardingTagVersion we want to update
     *   }
     * })
     */
    upsert<T extends OnboardingTagVersionUpsertArgs>(args: SelectSubset<T, OnboardingTagVersionUpsertArgs<ExtArgs>>): Prisma__OnboardingTagVersionClient<$Result.GetResult<Prisma.$OnboardingTagVersionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of OnboardingTagVersions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingTagVersionCountArgs} args - Arguments to filter OnboardingTagVersions to count.
     * @example
     * // Count the number of OnboardingTagVersions
     * const count = await prisma.onboardingTagVersion.count({
     *   where: {
     *     // ... the filter for the OnboardingTagVersions we want to count
     *   }
     * })
    **/
    count<T extends OnboardingTagVersionCountArgs>(
      args?: Subset<T, OnboardingTagVersionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OnboardingTagVersionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OnboardingTagVersion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingTagVersionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OnboardingTagVersionAggregateArgs>(args: Subset<T, OnboardingTagVersionAggregateArgs>): Prisma.PrismaPromise<GetOnboardingTagVersionAggregateType<T>>

    /**
     * Group by OnboardingTagVersion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingTagVersionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OnboardingTagVersionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OnboardingTagVersionGroupByArgs['orderBy'] }
        : { orderBy?: OnboardingTagVersionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OnboardingTagVersionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOnboardingTagVersionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OnboardingTagVersion model
   */
  readonly fields: OnboardingTagVersionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OnboardingTagVersion.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OnboardingTagVersionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    questions<T extends OnboardingTagVersion$questionsArgs<ExtArgs> = {}>(args?: Subset<T, OnboardingTagVersion$questionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OnboardingQuestionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    responses<T extends OnboardingTagVersion$responsesArgs<ExtArgs> = {}>(args?: Subset<T, OnboardingTagVersion$responsesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OnboardingResponsePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the OnboardingTagVersion model
   */
  interface OnboardingTagVersionFieldRefs {
    readonly id: FieldRef<"OnboardingTagVersion", 'String'>
    readonly tag: FieldRef<"OnboardingTagVersion", 'String'>
    readonly title: FieldRef<"OnboardingTagVersion", 'String'>
    readonly description: FieldRef<"OnboardingTagVersion", 'String'>
    readonly status: FieldRef<"OnboardingTagVersion", 'TagStatus'>
    readonly createdAt: FieldRef<"OnboardingTagVersion", 'DateTime'>
    readonly publishedAt: FieldRef<"OnboardingTagVersion", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * OnboardingTagVersion findUnique
   */
  export type OnboardingTagVersionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingTagVersion
     */
    select?: OnboardingTagVersionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingTagVersion
     */
    omit?: OnboardingTagVersionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingTagVersionInclude<ExtArgs> | null
    /**
     * Filter, which OnboardingTagVersion to fetch.
     */
    where: OnboardingTagVersionWhereUniqueInput
  }

  /**
   * OnboardingTagVersion findUniqueOrThrow
   */
  export type OnboardingTagVersionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingTagVersion
     */
    select?: OnboardingTagVersionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingTagVersion
     */
    omit?: OnboardingTagVersionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingTagVersionInclude<ExtArgs> | null
    /**
     * Filter, which OnboardingTagVersion to fetch.
     */
    where: OnboardingTagVersionWhereUniqueInput
  }

  /**
   * OnboardingTagVersion findFirst
   */
  export type OnboardingTagVersionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingTagVersion
     */
    select?: OnboardingTagVersionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingTagVersion
     */
    omit?: OnboardingTagVersionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingTagVersionInclude<ExtArgs> | null
    /**
     * Filter, which OnboardingTagVersion to fetch.
     */
    where?: OnboardingTagVersionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OnboardingTagVersions to fetch.
     */
    orderBy?: OnboardingTagVersionOrderByWithRelationInput | OnboardingTagVersionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OnboardingTagVersions.
     */
    cursor?: OnboardingTagVersionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OnboardingTagVersions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OnboardingTagVersions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OnboardingTagVersions.
     */
    distinct?: OnboardingTagVersionScalarFieldEnum | OnboardingTagVersionScalarFieldEnum[]
  }

  /**
   * OnboardingTagVersion findFirstOrThrow
   */
  export type OnboardingTagVersionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingTagVersion
     */
    select?: OnboardingTagVersionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingTagVersion
     */
    omit?: OnboardingTagVersionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingTagVersionInclude<ExtArgs> | null
    /**
     * Filter, which OnboardingTagVersion to fetch.
     */
    where?: OnboardingTagVersionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OnboardingTagVersions to fetch.
     */
    orderBy?: OnboardingTagVersionOrderByWithRelationInput | OnboardingTagVersionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OnboardingTagVersions.
     */
    cursor?: OnboardingTagVersionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OnboardingTagVersions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OnboardingTagVersions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OnboardingTagVersions.
     */
    distinct?: OnboardingTagVersionScalarFieldEnum | OnboardingTagVersionScalarFieldEnum[]
  }

  /**
   * OnboardingTagVersion findMany
   */
  export type OnboardingTagVersionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingTagVersion
     */
    select?: OnboardingTagVersionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingTagVersion
     */
    omit?: OnboardingTagVersionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingTagVersionInclude<ExtArgs> | null
    /**
     * Filter, which OnboardingTagVersions to fetch.
     */
    where?: OnboardingTagVersionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OnboardingTagVersions to fetch.
     */
    orderBy?: OnboardingTagVersionOrderByWithRelationInput | OnboardingTagVersionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OnboardingTagVersions.
     */
    cursor?: OnboardingTagVersionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OnboardingTagVersions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OnboardingTagVersions.
     */
    skip?: number
    distinct?: OnboardingTagVersionScalarFieldEnum | OnboardingTagVersionScalarFieldEnum[]
  }

  /**
   * OnboardingTagVersion create
   */
  export type OnboardingTagVersionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingTagVersion
     */
    select?: OnboardingTagVersionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingTagVersion
     */
    omit?: OnboardingTagVersionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingTagVersionInclude<ExtArgs> | null
    /**
     * The data needed to create a OnboardingTagVersion.
     */
    data: XOR<OnboardingTagVersionCreateInput, OnboardingTagVersionUncheckedCreateInput>
  }

  /**
   * OnboardingTagVersion createMany
   */
  export type OnboardingTagVersionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OnboardingTagVersions.
     */
    data: OnboardingTagVersionCreateManyInput | OnboardingTagVersionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OnboardingTagVersion createManyAndReturn
   */
  export type OnboardingTagVersionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingTagVersion
     */
    select?: OnboardingTagVersionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingTagVersion
     */
    omit?: OnboardingTagVersionOmit<ExtArgs> | null
    /**
     * The data used to create many OnboardingTagVersions.
     */
    data: OnboardingTagVersionCreateManyInput | OnboardingTagVersionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OnboardingTagVersion update
   */
  export type OnboardingTagVersionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingTagVersion
     */
    select?: OnboardingTagVersionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingTagVersion
     */
    omit?: OnboardingTagVersionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingTagVersionInclude<ExtArgs> | null
    /**
     * The data needed to update a OnboardingTagVersion.
     */
    data: XOR<OnboardingTagVersionUpdateInput, OnboardingTagVersionUncheckedUpdateInput>
    /**
     * Choose, which OnboardingTagVersion to update.
     */
    where: OnboardingTagVersionWhereUniqueInput
  }

  /**
   * OnboardingTagVersion updateMany
   */
  export type OnboardingTagVersionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OnboardingTagVersions.
     */
    data: XOR<OnboardingTagVersionUpdateManyMutationInput, OnboardingTagVersionUncheckedUpdateManyInput>
    /**
     * Filter which OnboardingTagVersions to update
     */
    where?: OnboardingTagVersionWhereInput
    /**
     * Limit how many OnboardingTagVersions to update.
     */
    limit?: number
  }

  /**
   * OnboardingTagVersion updateManyAndReturn
   */
  export type OnboardingTagVersionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingTagVersion
     */
    select?: OnboardingTagVersionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingTagVersion
     */
    omit?: OnboardingTagVersionOmit<ExtArgs> | null
    /**
     * The data used to update OnboardingTagVersions.
     */
    data: XOR<OnboardingTagVersionUpdateManyMutationInput, OnboardingTagVersionUncheckedUpdateManyInput>
    /**
     * Filter which OnboardingTagVersions to update
     */
    where?: OnboardingTagVersionWhereInput
    /**
     * Limit how many OnboardingTagVersions to update.
     */
    limit?: number
  }

  /**
   * OnboardingTagVersion upsert
   */
  export type OnboardingTagVersionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingTagVersion
     */
    select?: OnboardingTagVersionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingTagVersion
     */
    omit?: OnboardingTagVersionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingTagVersionInclude<ExtArgs> | null
    /**
     * The filter to search for the OnboardingTagVersion to update in case it exists.
     */
    where: OnboardingTagVersionWhereUniqueInput
    /**
     * In case the OnboardingTagVersion found by the `where` argument doesn't exist, create a new OnboardingTagVersion with this data.
     */
    create: XOR<OnboardingTagVersionCreateInput, OnboardingTagVersionUncheckedCreateInput>
    /**
     * In case the OnboardingTagVersion was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OnboardingTagVersionUpdateInput, OnboardingTagVersionUncheckedUpdateInput>
  }

  /**
   * OnboardingTagVersion delete
   */
  export type OnboardingTagVersionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingTagVersion
     */
    select?: OnboardingTagVersionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingTagVersion
     */
    omit?: OnboardingTagVersionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingTagVersionInclude<ExtArgs> | null
    /**
     * Filter which OnboardingTagVersion to delete.
     */
    where: OnboardingTagVersionWhereUniqueInput
  }

  /**
   * OnboardingTagVersion deleteMany
   */
  export type OnboardingTagVersionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OnboardingTagVersions to delete
     */
    where?: OnboardingTagVersionWhereInput
    /**
     * Limit how many OnboardingTagVersions to delete.
     */
    limit?: number
  }

  /**
   * OnboardingTagVersion.questions
   */
  export type OnboardingTagVersion$questionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingQuestion
     */
    select?: OnboardingQuestionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingQuestion
     */
    omit?: OnboardingQuestionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingQuestionInclude<ExtArgs> | null
    where?: OnboardingQuestionWhereInput
    orderBy?: OnboardingQuestionOrderByWithRelationInput | OnboardingQuestionOrderByWithRelationInput[]
    cursor?: OnboardingQuestionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OnboardingQuestionScalarFieldEnum | OnboardingQuestionScalarFieldEnum[]
  }

  /**
   * OnboardingTagVersion.responses
   */
  export type OnboardingTagVersion$responsesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingResponse
     */
    select?: OnboardingResponseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingResponse
     */
    omit?: OnboardingResponseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingResponseInclude<ExtArgs> | null
    where?: OnboardingResponseWhereInput
    orderBy?: OnboardingResponseOrderByWithRelationInput | OnboardingResponseOrderByWithRelationInput[]
    cursor?: OnboardingResponseWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OnboardingResponseScalarFieldEnum | OnboardingResponseScalarFieldEnum[]
  }

  /**
   * OnboardingTagVersion without action
   */
  export type OnboardingTagVersionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingTagVersion
     */
    select?: OnboardingTagVersionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingTagVersion
     */
    omit?: OnboardingTagVersionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingTagVersionInclude<ExtArgs> | null
  }


  /**
   * Model OnboardingQuestion
   */

  export type AggregateOnboardingQuestion = {
    _count: OnboardingQuestionCountAggregateOutputType | null
    _avg: OnboardingQuestionAvgAggregateOutputType | null
    _sum: OnboardingQuestionSumAggregateOutputType | null
    _min: OnboardingQuestionMinAggregateOutputType | null
    _max: OnboardingQuestionMaxAggregateOutputType | null
  }

  export type OnboardingQuestionAvgAggregateOutputType = {
    sortOrder: number | null
  }

  export type OnboardingQuestionSumAggregateOutputType = {
    sortOrder: number | null
  }

  export type OnboardingQuestionMinAggregateOutputType = {
    id: string | null
    versionId: string | null
    slug: string | null
    type: $Enums.QuestionType | null
    title: string | null
    iconSlug: string | null
    isActive: boolean | null
    sortOrder: number | null
    allowOtherOption: boolean | null
    createdAt: Date | null
  }

  export type OnboardingQuestionMaxAggregateOutputType = {
    id: string | null
    versionId: string | null
    slug: string | null
    type: $Enums.QuestionType | null
    title: string | null
    iconSlug: string | null
    isActive: boolean | null
    sortOrder: number | null
    allowOtherOption: boolean | null
    createdAt: Date | null
  }

  export type OnboardingQuestionCountAggregateOutputType = {
    id: number
    versionId: number
    slug: number
    type: number
    title: number
    iconSlug: number
    isActive: number
    sortOrder: number
    allowOtherOption: number
    createdAt: number
    _all: number
  }


  export type OnboardingQuestionAvgAggregateInputType = {
    sortOrder?: true
  }

  export type OnboardingQuestionSumAggregateInputType = {
    sortOrder?: true
  }

  export type OnboardingQuestionMinAggregateInputType = {
    id?: true
    versionId?: true
    slug?: true
    type?: true
    title?: true
    iconSlug?: true
    isActive?: true
    sortOrder?: true
    allowOtherOption?: true
    createdAt?: true
  }

  export type OnboardingQuestionMaxAggregateInputType = {
    id?: true
    versionId?: true
    slug?: true
    type?: true
    title?: true
    iconSlug?: true
    isActive?: true
    sortOrder?: true
    allowOtherOption?: true
    createdAt?: true
  }

  export type OnboardingQuestionCountAggregateInputType = {
    id?: true
    versionId?: true
    slug?: true
    type?: true
    title?: true
    iconSlug?: true
    isActive?: true
    sortOrder?: true
    allowOtherOption?: true
    createdAt?: true
    _all?: true
  }

  export type OnboardingQuestionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OnboardingQuestion to aggregate.
     */
    where?: OnboardingQuestionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OnboardingQuestions to fetch.
     */
    orderBy?: OnboardingQuestionOrderByWithRelationInput | OnboardingQuestionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OnboardingQuestionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OnboardingQuestions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OnboardingQuestions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OnboardingQuestions
    **/
    _count?: true | OnboardingQuestionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OnboardingQuestionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OnboardingQuestionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OnboardingQuestionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OnboardingQuestionMaxAggregateInputType
  }

  export type GetOnboardingQuestionAggregateType<T extends OnboardingQuestionAggregateArgs> = {
        [P in keyof T & keyof AggregateOnboardingQuestion]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOnboardingQuestion[P]>
      : GetScalarType<T[P], AggregateOnboardingQuestion[P]>
  }




  export type OnboardingQuestionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OnboardingQuestionWhereInput
    orderBy?: OnboardingQuestionOrderByWithAggregationInput | OnboardingQuestionOrderByWithAggregationInput[]
    by: OnboardingQuestionScalarFieldEnum[] | OnboardingQuestionScalarFieldEnum
    having?: OnboardingQuestionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OnboardingQuestionCountAggregateInputType | true
    _avg?: OnboardingQuestionAvgAggregateInputType
    _sum?: OnboardingQuestionSumAggregateInputType
    _min?: OnboardingQuestionMinAggregateInputType
    _max?: OnboardingQuestionMaxAggregateInputType
  }

  export type OnboardingQuestionGroupByOutputType = {
    id: string
    versionId: string
    slug: string
    type: $Enums.QuestionType
    title: string
    iconSlug: string | null
    isActive: boolean
    sortOrder: number
    allowOtherOption: boolean
    createdAt: Date
    _count: OnboardingQuestionCountAggregateOutputType | null
    _avg: OnboardingQuestionAvgAggregateOutputType | null
    _sum: OnboardingQuestionSumAggregateOutputType | null
    _min: OnboardingQuestionMinAggregateOutputType | null
    _max: OnboardingQuestionMaxAggregateOutputType | null
  }

  type GetOnboardingQuestionGroupByPayload<T extends OnboardingQuestionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OnboardingQuestionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OnboardingQuestionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OnboardingQuestionGroupByOutputType[P]>
            : GetScalarType<T[P], OnboardingQuestionGroupByOutputType[P]>
        }
      >
    >


  export type OnboardingQuestionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    versionId?: boolean
    slug?: boolean
    type?: boolean
    title?: boolean
    iconSlug?: boolean
    isActive?: boolean
    sortOrder?: boolean
    allowOtherOption?: boolean
    createdAt?: boolean
    version?: boolean | OnboardingTagVersionDefaultArgs<ExtArgs>
    options?: boolean | OnboardingQuestion$optionsArgs<ExtArgs>
    answers?: boolean | OnboardingQuestion$answersArgs<ExtArgs>
    _count?: boolean | OnboardingQuestionCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["onboardingQuestion"]>

  export type OnboardingQuestionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    versionId?: boolean
    slug?: boolean
    type?: boolean
    title?: boolean
    iconSlug?: boolean
    isActive?: boolean
    sortOrder?: boolean
    allowOtherOption?: boolean
    createdAt?: boolean
    version?: boolean | OnboardingTagVersionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["onboardingQuestion"]>

  export type OnboardingQuestionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    versionId?: boolean
    slug?: boolean
    type?: boolean
    title?: boolean
    iconSlug?: boolean
    isActive?: boolean
    sortOrder?: boolean
    allowOtherOption?: boolean
    createdAt?: boolean
    version?: boolean | OnboardingTagVersionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["onboardingQuestion"]>

  export type OnboardingQuestionSelectScalar = {
    id?: boolean
    versionId?: boolean
    slug?: boolean
    type?: boolean
    title?: boolean
    iconSlug?: boolean
    isActive?: boolean
    sortOrder?: boolean
    allowOtherOption?: boolean
    createdAt?: boolean
  }

  export type OnboardingQuestionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "versionId" | "slug" | "type" | "title" | "iconSlug" | "isActive" | "sortOrder" | "allowOtherOption" | "createdAt", ExtArgs["result"]["onboardingQuestion"]>
  export type OnboardingQuestionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    version?: boolean | OnboardingTagVersionDefaultArgs<ExtArgs>
    options?: boolean | OnboardingQuestion$optionsArgs<ExtArgs>
    answers?: boolean | OnboardingQuestion$answersArgs<ExtArgs>
    _count?: boolean | OnboardingQuestionCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type OnboardingQuestionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    version?: boolean | OnboardingTagVersionDefaultArgs<ExtArgs>
  }
  export type OnboardingQuestionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    version?: boolean | OnboardingTagVersionDefaultArgs<ExtArgs>
  }

  export type $OnboardingQuestionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OnboardingQuestion"
    objects: {
      version: Prisma.$OnboardingTagVersionPayload<ExtArgs>
      options: Prisma.$OnboardingOptionPayload<ExtArgs>[]
      answers: Prisma.$OnboardingAnswerPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      versionId: string
      slug: string
      type: $Enums.QuestionType
      title: string
      iconSlug: string | null
      isActive: boolean
      sortOrder: number
      allowOtherOption: boolean
      createdAt: Date
    }, ExtArgs["result"]["onboardingQuestion"]>
    composites: {}
  }

  type OnboardingQuestionGetPayload<S extends boolean | null | undefined | OnboardingQuestionDefaultArgs> = $Result.GetResult<Prisma.$OnboardingQuestionPayload, S>

  type OnboardingQuestionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OnboardingQuestionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OnboardingQuestionCountAggregateInputType | true
    }

  export interface OnboardingQuestionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OnboardingQuestion'], meta: { name: 'OnboardingQuestion' } }
    /**
     * Find zero or one OnboardingQuestion that matches the filter.
     * @param {OnboardingQuestionFindUniqueArgs} args - Arguments to find a OnboardingQuestion
     * @example
     * // Get one OnboardingQuestion
     * const onboardingQuestion = await prisma.onboardingQuestion.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OnboardingQuestionFindUniqueArgs>(args: SelectSubset<T, OnboardingQuestionFindUniqueArgs<ExtArgs>>): Prisma__OnboardingQuestionClient<$Result.GetResult<Prisma.$OnboardingQuestionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one OnboardingQuestion that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OnboardingQuestionFindUniqueOrThrowArgs} args - Arguments to find a OnboardingQuestion
     * @example
     * // Get one OnboardingQuestion
     * const onboardingQuestion = await prisma.onboardingQuestion.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OnboardingQuestionFindUniqueOrThrowArgs>(args: SelectSubset<T, OnboardingQuestionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OnboardingQuestionClient<$Result.GetResult<Prisma.$OnboardingQuestionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OnboardingQuestion that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingQuestionFindFirstArgs} args - Arguments to find a OnboardingQuestion
     * @example
     * // Get one OnboardingQuestion
     * const onboardingQuestion = await prisma.onboardingQuestion.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OnboardingQuestionFindFirstArgs>(args?: SelectSubset<T, OnboardingQuestionFindFirstArgs<ExtArgs>>): Prisma__OnboardingQuestionClient<$Result.GetResult<Prisma.$OnboardingQuestionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OnboardingQuestion that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingQuestionFindFirstOrThrowArgs} args - Arguments to find a OnboardingQuestion
     * @example
     * // Get one OnboardingQuestion
     * const onboardingQuestion = await prisma.onboardingQuestion.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OnboardingQuestionFindFirstOrThrowArgs>(args?: SelectSubset<T, OnboardingQuestionFindFirstOrThrowArgs<ExtArgs>>): Prisma__OnboardingQuestionClient<$Result.GetResult<Prisma.$OnboardingQuestionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more OnboardingQuestions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingQuestionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OnboardingQuestions
     * const onboardingQuestions = await prisma.onboardingQuestion.findMany()
     * 
     * // Get first 10 OnboardingQuestions
     * const onboardingQuestions = await prisma.onboardingQuestion.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const onboardingQuestionWithIdOnly = await prisma.onboardingQuestion.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OnboardingQuestionFindManyArgs>(args?: SelectSubset<T, OnboardingQuestionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OnboardingQuestionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a OnboardingQuestion.
     * @param {OnboardingQuestionCreateArgs} args - Arguments to create a OnboardingQuestion.
     * @example
     * // Create one OnboardingQuestion
     * const OnboardingQuestion = await prisma.onboardingQuestion.create({
     *   data: {
     *     // ... data to create a OnboardingQuestion
     *   }
     * })
     * 
     */
    create<T extends OnboardingQuestionCreateArgs>(args: SelectSubset<T, OnboardingQuestionCreateArgs<ExtArgs>>): Prisma__OnboardingQuestionClient<$Result.GetResult<Prisma.$OnboardingQuestionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many OnboardingQuestions.
     * @param {OnboardingQuestionCreateManyArgs} args - Arguments to create many OnboardingQuestions.
     * @example
     * // Create many OnboardingQuestions
     * const onboardingQuestion = await prisma.onboardingQuestion.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OnboardingQuestionCreateManyArgs>(args?: SelectSubset<T, OnboardingQuestionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many OnboardingQuestions and returns the data saved in the database.
     * @param {OnboardingQuestionCreateManyAndReturnArgs} args - Arguments to create many OnboardingQuestions.
     * @example
     * // Create many OnboardingQuestions
     * const onboardingQuestion = await prisma.onboardingQuestion.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many OnboardingQuestions and only return the `id`
     * const onboardingQuestionWithIdOnly = await prisma.onboardingQuestion.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OnboardingQuestionCreateManyAndReturnArgs>(args?: SelectSubset<T, OnboardingQuestionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OnboardingQuestionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a OnboardingQuestion.
     * @param {OnboardingQuestionDeleteArgs} args - Arguments to delete one OnboardingQuestion.
     * @example
     * // Delete one OnboardingQuestion
     * const OnboardingQuestion = await prisma.onboardingQuestion.delete({
     *   where: {
     *     // ... filter to delete one OnboardingQuestion
     *   }
     * })
     * 
     */
    delete<T extends OnboardingQuestionDeleteArgs>(args: SelectSubset<T, OnboardingQuestionDeleteArgs<ExtArgs>>): Prisma__OnboardingQuestionClient<$Result.GetResult<Prisma.$OnboardingQuestionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one OnboardingQuestion.
     * @param {OnboardingQuestionUpdateArgs} args - Arguments to update one OnboardingQuestion.
     * @example
     * // Update one OnboardingQuestion
     * const onboardingQuestion = await prisma.onboardingQuestion.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OnboardingQuestionUpdateArgs>(args: SelectSubset<T, OnboardingQuestionUpdateArgs<ExtArgs>>): Prisma__OnboardingQuestionClient<$Result.GetResult<Prisma.$OnboardingQuestionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more OnboardingQuestions.
     * @param {OnboardingQuestionDeleteManyArgs} args - Arguments to filter OnboardingQuestions to delete.
     * @example
     * // Delete a few OnboardingQuestions
     * const { count } = await prisma.onboardingQuestion.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OnboardingQuestionDeleteManyArgs>(args?: SelectSubset<T, OnboardingQuestionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OnboardingQuestions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingQuestionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OnboardingQuestions
     * const onboardingQuestion = await prisma.onboardingQuestion.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OnboardingQuestionUpdateManyArgs>(args: SelectSubset<T, OnboardingQuestionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OnboardingQuestions and returns the data updated in the database.
     * @param {OnboardingQuestionUpdateManyAndReturnArgs} args - Arguments to update many OnboardingQuestions.
     * @example
     * // Update many OnboardingQuestions
     * const onboardingQuestion = await prisma.onboardingQuestion.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more OnboardingQuestions and only return the `id`
     * const onboardingQuestionWithIdOnly = await prisma.onboardingQuestion.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends OnboardingQuestionUpdateManyAndReturnArgs>(args: SelectSubset<T, OnboardingQuestionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OnboardingQuestionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one OnboardingQuestion.
     * @param {OnboardingQuestionUpsertArgs} args - Arguments to update or create a OnboardingQuestion.
     * @example
     * // Update or create a OnboardingQuestion
     * const onboardingQuestion = await prisma.onboardingQuestion.upsert({
     *   create: {
     *     // ... data to create a OnboardingQuestion
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OnboardingQuestion we want to update
     *   }
     * })
     */
    upsert<T extends OnboardingQuestionUpsertArgs>(args: SelectSubset<T, OnboardingQuestionUpsertArgs<ExtArgs>>): Prisma__OnboardingQuestionClient<$Result.GetResult<Prisma.$OnboardingQuestionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of OnboardingQuestions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingQuestionCountArgs} args - Arguments to filter OnboardingQuestions to count.
     * @example
     * // Count the number of OnboardingQuestions
     * const count = await prisma.onboardingQuestion.count({
     *   where: {
     *     // ... the filter for the OnboardingQuestions we want to count
     *   }
     * })
    **/
    count<T extends OnboardingQuestionCountArgs>(
      args?: Subset<T, OnboardingQuestionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OnboardingQuestionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OnboardingQuestion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingQuestionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OnboardingQuestionAggregateArgs>(args: Subset<T, OnboardingQuestionAggregateArgs>): Prisma.PrismaPromise<GetOnboardingQuestionAggregateType<T>>

    /**
     * Group by OnboardingQuestion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingQuestionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OnboardingQuestionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OnboardingQuestionGroupByArgs['orderBy'] }
        : { orderBy?: OnboardingQuestionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OnboardingQuestionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOnboardingQuestionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OnboardingQuestion model
   */
  readonly fields: OnboardingQuestionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OnboardingQuestion.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OnboardingQuestionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    version<T extends OnboardingTagVersionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OnboardingTagVersionDefaultArgs<ExtArgs>>): Prisma__OnboardingTagVersionClient<$Result.GetResult<Prisma.$OnboardingTagVersionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    options<T extends OnboardingQuestion$optionsArgs<ExtArgs> = {}>(args?: Subset<T, OnboardingQuestion$optionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OnboardingOptionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    answers<T extends OnboardingQuestion$answersArgs<ExtArgs> = {}>(args?: Subset<T, OnboardingQuestion$answersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OnboardingAnswerPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the OnboardingQuestion model
   */
  interface OnboardingQuestionFieldRefs {
    readonly id: FieldRef<"OnboardingQuestion", 'String'>
    readonly versionId: FieldRef<"OnboardingQuestion", 'String'>
    readonly slug: FieldRef<"OnboardingQuestion", 'String'>
    readonly type: FieldRef<"OnboardingQuestion", 'QuestionType'>
    readonly title: FieldRef<"OnboardingQuestion", 'String'>
    readonly iconSlug: FieldRef<"OnboardingQuestion", 'String'>
    readonly isActive: FieldRef<"OnboardingQuestion", 'Boolean'>
    readonly sortOrder: FieldRef<"OnboardingQuestion", 'Int'>
    readonly allowOtherOption: FieldRef<"OnboardingQuestion", 'Boolean'>
    readonly createdAt: FieldRef<"OnboardingQuestion", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * OnboardingQuestion findUnique
   */
  export type OnboardingQuestionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingQuestion
     */
    select?: OnboardingQuestionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingQuestion
     */
    omit?: OnboardingQuestionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingQuestionInclude<ExtArgs> | null
    /**
     * Filter, which OnboardingQuestion to fetch.
     */
    where: OnboardingQuestionWhereUniqueInput
  }

  /**
   * OnboardingQuestion findUniqueOrThrow
   */
  export type OnboardingQuestionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingQuestion
     */
    select?: OnboardingQuestionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingQuestion
     */
    omit?: OnboardingQuestionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingQuestionInclude<ExtArgs> | null
    /**
     * Filter, which OnboardingQuestion to fetch.
     */
    where: OnboardingQuestionWhereUniqueInput
  }

  /**
   * OnboardingQuestion findFirst
   */
  export type OnboardingQuestionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingQuestion
     */
    select?: OnboardingQuestionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingQuestion
     */
    omit?: OnboardingQuestionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingQuestionInclude<ExtArgs> | null
    /**
     * Filter, which OnboardingQuestion to fetch.
     */
    where?: OnboardingQuestionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OnboardingQuestions to fetch.
     */
    orderBy?: OnboardingQuestionOrderByWithRelationInput | OnboardingQuestionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OnboardingQuestions.
     */
    cursor?: OnboardingQuestionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OnboardingQuestions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OnboardingQuestions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OnboardingQuestions.
     */
    distinct?: OnboardingQuestionScalarFieldEnum | OnboardingQuestionScalarFieldEnum[]
  }

  /**
   * OnboardingQuestion findFirstOrThrow
   */
  export type OnboardingQuestionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingQuestion
     */
    select?: OnboardingQuestionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingQuestion
     */
    omit?: OnboardingQuestionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingQuestionInclude<ExtArgs> | null
    /**
     * Filter, which OnboardingQuestion to fetch.
     */
    where?: OnboardingQuestionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OnboardingQuestions to fetch.
     */
    orderBy?: OnboardingQuestionOrderByWithRelationInput | OnboardingQuestionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OnboardingQuestions.
     */
    cursor?: OnboardingQuestionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OnboardingQuestions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OnboardingQuestions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OnboardingQuestions.
     */
    distinct?: OnboardingQuestionScalarFieldEnum | OnboardingQuestionScalarFieldEnum[]
  }

  /**
   * OnboardingQuestion findMany
   */
  export type OnboardingQuestionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingQuestion
     */
    select?: OnboardingQuestionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingQuestion
     */
    omit?: OnboardingQuestionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingQuestionInclude<ExtArgs> | null
    /**
     * Filter, which OnboardingQuestions to fetch.
     */
    where?: OnboardingQuestionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OnboardingQuestions to fetch.
     */
    orderBy?: OnboardingQuestionOrderByWithRelationInput | OnboardingQuestionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OnboardingQuestions.
     */
    cursor?: OnboardingQuestionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OnboardingQuestions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OnboardingQuestions.
     */
    skip?: number
    distinct?: OnboardingQuestionScalarFieldEnum | OnboardingQuestionScalarFieldEnum[]
  }

  /**
   * OnboardingQuestion create
   */
  export type OnboardingQuestionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingQuestion
     */
    select?: OnboardingQuestionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingQuestion
     */
    omit?: OnboardingQuestionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingQuestionInclude<ExtArgs> | null
    /**
     * The data needed to create a OnboardingQuestion.
     */
    data: XOR<OnboardingQuestionCreateInput, OnboardingQuestionUncheckedCreateInput>
  }

  /**
   * OnboardingQuestion createMany
   */
  export type OnboardingQuestionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OnboardingQuestions.
     */
    data: OnboardingQuestionCreateManyInput | OnboardingQuestionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OnboardingQuestion createManyAndReturn
   */
  export type OnboardingQuestionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingQuestion
     */
    select?: OnboardingQuestionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingQuestion
     */
    omit?: OnboardingQuestionOmit<ExtArgs> | null
    /**
     * The data used to create many OnboardingQuestions.
     */
    data: OnboardingQuestionCreateManyInput | OnboardingQuestionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingQuestionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * OnboardingQuestion update
   */
  export type OnboardingQuestionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingQuestion
     */
    select?: OnboardingQuestionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingQuestion
     */
    omit?: OnboardingQuestionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingQuestionInclude<ExtArgs> | null
    /**
     * The data needed to update a OnboardingQuestion.
     */
    data: XOR<OnboardingQuestionUpdateInput, OnboardingQuestionUncheckedUpdateInput>
    /**
     * Choose, which OnboardingQuestion to update.
     */
    where: OnboardingQuestionWhereUniqueInput
  }

  /**
   * OnboardingQuestion updateMany
   */
  export type OnboardingQuestionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OnboardingQuestions.
     */
    data: XOR<OnboardingQuestionUpdateManyMutationInput, OnboardingQuestionUncheckedUpdateManyInput>
    /**
     * Filter which OnboardingQuestions to update
     */
    where?: OnboardingQuestionWhereInput
    /**
     * Limit how many OnboardingQuestions to update.
     */
    limit?: number
  }

  /**
   * OnboardingQuestion updateManyAndReturn
   */
  export type OnboardingQuestionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingQuestion
     */
    select?: OnboardingQuestionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingQuestion
     */
    omit?: OnboardingQuestionOmit<ExtArgs> | null
    /**
     * The data used to update OnboardingQuestions.
     */
    data: XOR<OnboardingQuestionUpdateManyMutationInput, OnboardingQuestionUncheckedUpdateManyInput>
    /**
     * Filter which OnboardingQuestions to update
     */
    where?: OnboardingQuestionWhereInput
    /**
     * Limit how many OnboardingQuestions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingQuestionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * OnboardingQuestion upsert
   */
  export type OnboardingQuestionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingQuestion
     */
    select?: OnboardingQuestionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingQuestion
     */
    omit?: OnboardingQuestionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingQuestionInclude<ExtArgs> | null
    /**
     * The filter to search for the OnboardingQuestion to update in case it exists.
     */
    where: OnboardingQuestionWhereUniqueInput
    /**
     * In case the OnboardingQuestion found by the `where` argument doesn't exist, create a new OnboardingQuestion with this data.
     */
    create: XOR<OnboardingQuestionCreateInput, OnboardingQuestionUncheckedCreateInput>
    /**
     * In case the OnboardingQuestion was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OnboardingQuestionUpdateInput, OnboardingQuestionUncheckedUpdateInput>
  }

  /**
   * OnboardingQuestion delete
   */
  export type OnboardingQuestionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingQuestion
     */
    select?: OnboardingQuestionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingQuestion
     */
    omit?: OnboardingQuestionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingQuestionInclude<ExtArgs> | null
    /**
     * Filter which OnboardingQuestion to delete.
     */
    where: OnboardingQuestionWhereUniqueInput
  }

  /**
   * OnboardingQuestion deleteMany
   */
  export type OnboardingQuestionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OnboardingQuestions to delete
     */
    where?: OnboardingQuestionWhereInput
    /**
     * Limit how many OnboardingQuestions to delete.
     */
    limit?: number
  }

  /**
   * OnboardingQuestion.options
   */
  export type OnboardingQuestion$optionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingOption
     */
    select?: OnboardingOptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingOption
     */
    omit?: OnboardingOptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingOptionInclude<ExtArgs> | null
    where?: OnboardingOptionWhereInput
    orderBy?: OnboardingOptionOrderByWithRelationInput | OnboardingOptionOrderByWithRelationInput[]
    cursor?: OnboardingOptionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OnboardingOptionScalarFieldEnum | OnboardingOptionScalarFieldEnum[]
  }

  /**
   * OnboardingQuestion.answers
   */
  export type OnboardingQuestion$answersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingAnswer
     */
    select?: OnboardingAnswerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingAnswer
     */
    omit?: OnboardingAnswerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingAnswerInclude<ExtArgs> | null
    where?: OnboardingAnswerWhereInput
    orderBy?: OnboardingAnswerOrderByWithRelationInput | OnboardingAnswerOrderByWithRelationInput[]
    cursor?: OnboardingAnswerWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OnboardingAnswerScalarFieldEnum | OnboardingAnswerScalarFieldEnum[]
  }

  /**
   * OnboardingQuestion without action
   */
  export type OnboardingQuestionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingQuestion
     */
    select?: OnboardingQuestionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingQuestion
     */
    omit?: OnboardingQuestionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingQuestionInclude<ExtArgs> | null
  }


  /**
   * Model OnboardingOption
   */

  export type AggregateOnboardingOption = {
    _count: OnboardingOptionCountAggregateOutputType | null
    _avg: OnboardingOptionAvgAggregateOutputType | null
    _sum: OnboardingOptionSumAggregateOutputType | null
    _min: OnboardingOptionMinAggregateOutputType | null
    _max: OnboardingOptionMaxAggregateOutputType | null
  }

  export type OnboardingOptionAvgAggregateOutputType = {
    sortOrder: number | null
  }

  export type OnboardingOptionSumAggregateOutputType = {
    sortOrder: number | null
  }

  export type OnboardingOptionMinAggregateOutputType = {
    id: string | null
    questionId: string | null
    value: string | null
    label: string | null
    iconSlug: string | null
    sortOrder: number | null
  }

  export type OnboardingOptionMaxAggregateOutputType = {
    id: string | null
    questionId: string | null
    value: string | null
    label: string | null
    iconSlug: string | null
    sortOrder: number | null
  }

  export type OnboardingOptionCountAggregateOutputType = {
    id: number
    questionId: number
    value: number
    label: number
    iconSlug: number
    sortOrder: number
    _all: number
  }


  export type OnboardingOptionAvgAggregateInputType = {
    sortOrder?: true
  }

  export type OnboardingOptionSumAggregateInputType = {
    sortOrder?: true
  }

  export type OnboardingOptionMinAggregateInputType = {
    id?: true
    questionId?: true
    value?: true
    label?: true
    iconSlug?: true
    sortOrder?: true
  }

  export type OnboardingOptionMaxAggregateInputType = {
    id?: true
    questionId?: true
    value?: true
    label?: true
    iconSlug?: true
    sortOrder?: true
  }

  export type OnboardingOptionCountAggregateInputType = {
    id?: true
    questionId?: true
    value?: true
    label?: true
    iconSlug?: true
    sortOrder?: true
    _all?: true
  }

  export type OnboardingOptionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OnboardingOption to aggregate.
     */
    where?: OnboardingOptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OnboardingOptions to fetch.
     */
    orderBy?: OnboardingOptionOrderByWithRelationInput | OnboardingOptionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OnboardingOptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OnboardingOptions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OnboardingOptions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OnboardingOptions
    **/
    _count?: true | OnboardingOptionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OnboardingOptionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OnboardingOptionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OnboardingOptionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OnboardingOptionMaxAggregateInputType
  }

  export type GetOnboardingOptionAggregateType<T extends OnboardingOptionAggregateArgs> = {
        [P in keyof T & keyof AggregateOnboardingOption]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOnboardingOption[P]>
      : GetScalarType<T[P], AggregateOnboardingOption[P]>
  }




  export type OnboardingOptionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OnboardingOptionWhereInput
    orderBy?: OnboardingOptionOrderByWithAggregationInput | OnboardingOptionOrderByWithAggregationInput[]
    by: OnboardingOptionScalarFieldEnum[] | OnboardingOptionScalarFieldEnum
    having?: OnboardingOptionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OnboardingOptionCountAggregateInputType | true
    _avg?: OnboardingOptionAvgAggregateInputType
    _sum?: OnboardingOptionSumAggregateInputType
    _min?: OnboardingOptionMinAggregateInputType
    _max?: OnboardingOptionMaxAggregateInputType
  }

  export type OnboardingOptionGroupByOutputType = {
    id: string
    questionId: string
    value: string
    label: string
    iconSlug: string | null
    sortOrder: number | null
    _count: OnboardingOptionCountAggregateOutputType | null
    _avg: OnboardingOptionAvgAggregateOutputType | null
    _sum: OnboardingOptionSumAggregateOutputType | null
    _min: OnboardingOptionMinAggregateOutputType | null
    _max: OnboardingOptionMaxAggregateOutputType | null
  }

  type GetOnboardingOptionGroupByPayload<T extends OnboardingOptionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OnboardingOptionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OnboardingOptionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OnboardingOptionGroupByOutputType[P]>
            : GetScalarType<T[P], OnboardingOptionGroupByOutputType[P]>
        }
      >
    >


  export type OnboardingOptionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    questionId?: boolean
    value?: boolean
    label?: boolean
    iconSlug?: boolean
    sortOrder?: boolean
    question?: boolean | OnboardingQuestionDefaultArgs<ExtArgs>
    answers?: boolean | OnboardingOption$answersArgs<ExtArgs>
    _count?: boolean | OnboardingOptionCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["onboardingOption"]>

  export type OnboardingOptionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    questionId?: boolean
    value?: boolean
    label?: boolean
    iconSlug?: boolean
    sortOrder?: boolean
    question?: boolean | OnboardingQuestionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["onboardingOption"]>

  export type OnboardingOptionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    questionId?: boolean
    value?: boolean
    label?: boolean
    iconSlug?: boolean
    sortOrder?: boolean
    question?: boolean | OnboardingQuestionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["onboardingOption"]>

  export type OnboardingOptionSelectScalar = {
    id?: boolean
    questionId?: boolean
    value?: boolean
    label?: boolean
    iconSlug?: boolean
    sortOrder?: boolean
  }

  export type OnboardingOptionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "questionId" | "value" | "label" | "iconSlug" | "sortOrder", ExtArgs["result"]["onboardingOption"]>
  export type OnboardingOptionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    question?: boolean | OnboardingQuestionDefaultArgs<ExtArgs>
    answers?: boolean | OnboardingOption$answersArgs<ExtArgs>
    _count?: boolean | OnboardingOptionCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type OnboardingOptionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    question?: boolean | OnboardingQuestionDefaultArgs<ExtArgs>
  }
  export type OnboardingOptionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    question?: boolean | OnboardingQuestionDefaultArgs<ExtArgs>
  }

  export type $OnboardingOptionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OnboardingOption"
    objects: {
      question: Prisma.$OnboardingQuestionPayload<ExtArgs>
      answers: Prisma.$OnboardingAnswerPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      questionId: string
      value: string
      label: string
      iconSlug: string | null
      sortOrder: number | null
    }, ExtArgs["result"]["onboardingOption"]>
    composites: {}
  }

  type OnboardingOptionGetPayload<S extends boolean | null | undefined | OnboardingOptionDefaultArgs> = $Result.GetResult<Prisma.$OnboardingOptionPayload, S>

  type OnboardingOptionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OnboardingOptionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OnboardingOptionCountAggregateInputType | true
    }

  export interface OnboardingOptionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OnboardingOption'], meta: { name: 'OnboardingOption' } }
    /**
     * Find zero or one OnboardingOption that matches the filter.
     * @param {OnboardingOptionFindUniqueArgs} args - Arguments to find a OnboardingOption
     * @example
     * // Get one OnboardingOption
     * const onboardingOption = await prisma.onboardingOption.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OnboardingOptionFindUniqueArgs>(args: SelectSubset<T, OnboardingOptionFindUniqueArgs<ExtArgs>>): Prisma__OnboardingOptionClient<$Result.GetResult<Prisma.$OnboardingOptionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one OnboardingOption that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OnboardingOptionFindUniqueOrThrowArgs} args - Arguments to find a OnboardingOption
     * @example
     * // Get one OnboardingOption
     * const onboardingOption = await prisma.onboardingOption.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OnboardingOptionFindUniqueOrThrowArgs>(args: SelectSubset<T, OnboardingOptionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OnboardingOptionClient<$Result.GetResult<Prisma.$OnboardingOptionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OnboardingOption that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingOptionFindFirstArgs} args - Arguments to find a OnboardingOption
     * @example
     * // Get one OnboardingOption
     * const onboardingOption = await prisma.onboardingOption.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OnboardingOptionFindFirstArgs>(args?: SelectSubset<T, OnboardingOptionFindFirstArgs<ExtArgs>>): Prisma__OnboardingOptionClient<$Result.GetResult<Prisma.$OnboardingOptionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OnboardingOption that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingOptionFindFirstOrThrowArgs} args - Arguments to find a OnboardingOption
     * @example
     * // Get one OnboardingOption
     * const onboardingOption = await prisma.onboardingOption.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OnboardingOptionFindFirstOrThrowArgs>(args?: SelectSubset<T, OnboardingOptionFindFirstOrThrowArgs<ExtArgs>>): Prisma__OnboardingOptionClient<$Result.GetResult<Prisma.$OnboardingOptionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more OnboardingOptions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingOptionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OnboardingOptions
     * const onboardingOptions = await prisma.onboardingOption.findMany()
     * 
     * // Get first 10 OnboardingOptions
     * const onboardingOptions = await prisma.onboardingOption.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const onboardingOptionWithIdOnly = await prisma.onboardingOption.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OnboardingOptionFindManyArgs>(args?: SelectSubset<T, OnboardingOptionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OnboardingOptionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a OnboardingOption.
     * @param {OnboardingOptionCreateArgs} args - Arguments to create a OnboardingOption.
     * @example
     * // Create one OnboardingOption
     * const OnboardingOption = await prisma.onboardingOption.create({
     *   data: {
     *     // ... data to create a OnboardingOption
     *   }
     * })
     * 
     */
    create<T extends OnboardingOptionCreateArgs>(args: SelectSubset<T, OnboardingOptionCreateArgs<ExtArgs>>): Prisma__OnboardingOptionClient<$Result.GetResult<Prisma.$OnboardingOptionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many OnboardingOptions.
     * @param {OnboardingOptionCreateManyArgs} args - Arguments to create many OnboardingOptions.
     * @example
     * // Create many OnboardingOptions
     * const onboardingOption = await prisma.onboardingOption.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OnboardingOptionCreateManyArgs>(args?: SelectSubset<T, OnboardingOptionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many OnboardingOptions and returns the data saved in the database.
     * @param {OnboardingOptionCreateManyAndReturnArgs} args - Arguments to create many OnboardingOptions.
     * @example
     * // Create many OnboardingOptions
     * const onboardingOption = await prisma.onboardingOption.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many OnboardingOptions and only return the `id`
     * const onboardingOptionWithIdOnly = await prisma.onboardingOption.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OnboardingOptionCreateManyAndReturnArgs>(args?: SelectSubset<T, OnboardingOptionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OnboardingOptionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a OnboardingOption.
     * @param {OnboardingOptionDeleteArgs} args - Arguments to delete one OnboardingOption.
     * @example
     * // Delete one OnboardingOption
     * const OnboardingOption = await prisma.onboardingOption.delete({
     *   where: {
     *     // ... filter to delete one OnboardingOption
     *   }
     * })
     * 
     */
    delete<T extends OnboardingOptionDeleteArgs>(args: SelectSubset<T, OnboardingOptionDeleteArgs<ExtArgs>>): Prisma__OnboardingOptionClient<$Result.GetResult<Prisma.$OnboardingOptionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one OnboardingOption.
     * @param {OnboardingOptionUpdateArgs} args - Arguments to update one OnboardingOption.
     * @example
     * // Update one OnboardingOption
     * const onboardingOption = await prisma.onboardingOption.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OnboardingOptionUpdateArgs>(args: SelectSubset<T, OnboardingOptionUpdateArgs<ExtArgs>>): Prisma__OnboardingOptionClient<$Result.GetResult<Prisma.$OnboardingOptionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more OnboardingOptions.
     * @param {OnboardingOptionDeleteManyArgs} args - Arguments to filter OnboardingOptions to delete.
     * @example
     * // Delete a few OnboardingOptions
     * const { count } = await prisma.onboardingOption.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OnboardingOptionDeleteManyArgs>(args?: SelectSubset<T, OnboardingOptionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OnboardingOptions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingOptionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OnboardingOptions
     * const onboardingOption = await prisma.onboardingOption.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OnboardingOptionUpdateManyArgs>(args: SelectSubset<T, OnboardingOptionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OnboardingOptions and returns the data updated in the database.
     * @param {OnboardingOptionUpdateManyAndReturnArgs} args - Arguments to update many OnboardingOptions.
     * @example
     * // Update many OnboardingOptions
     * const onboardingOption = await prisma.onboardingOption.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more OnboardingOptions and only return the `id`
     * const onboardingOptionWithIdOnly = await prisma.onboardingOption.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends OnboardingOptionUpdateManyAndReturnArgs>(args: SelectSubset<T, OnboardingOptionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OnboardingOptionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one OnboardingOption.
     * @param {OnboardingOptionUpsertArgs} args - Arguments to update or create a OnboardingOption.
     * @example
     * // Update or create a OnboardingOption
     * const onboardingOption = await prisma.onboardingOption.upsert({
     *   create: {
     *     // ... data to create a OnboardingOption
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OnboardingOption we want to update
     *   }
     * })
     */
    upsert<T extends OnboardingOptionUpsertArgs>(args: SelectSubset<T, OnboardingOptionUpsertArgs<ExtArgs>>): Prisma__OnboardingOptionClient<$Result.GetResult<Prisma.$OnboardingOptionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of OnboardingOptions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingOptionCountArgs} args - Arguments to filter OnboardingOptions to count.
     * @example
     * // Count the number of OnboardingOptions
     * const count = await prisma.onboardingOption.count({
     *   where: {
     *     // ... the filter for the OnboardingOptions we want to count
     *   }
     * })
    **/
    count<T extends OnboardingOptionCountArgs>(
      args?: Subset<T, OnboardingOptionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OnboardingOptionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OnboardingOption.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingOptionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OnboardingOptionAggregateArgs>(args: Subset<T, OnboardingOptionAggregateArgs>): Prisma.PrismaPromise<GetOnboardingOptionAggregateType<T>>

    /**
     * Group by OnboardingOption.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingOptionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OnboardingOptionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OnboardingOptionGroupByArgs['orderBy'] }
        : { orderBy?: OnboardingOptionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OnboardingOptionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOnboardingOptionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OnboardingOption model
   */
  readonly fields: OnboardingOptionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OnboardingOption.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OnboardingOptionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    question<T extends OnboardingQuestionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OnboardingQuestionDefaultArgs<ExtArgs>>): Prisma__OnboardingQuestionClient<$Result.GetResult<Prisma.$OnboardingQuestionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    answers<T extends OnboardingOption$answersArgs<ExtArgs> = {}>(args?: Subset<T, OnboardingOption$answersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OnboardingAnswerPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the OnboardingOption model
   */
  interface OnboardingOptionFieldRefs {
    readonly id: FieldRef<"OnboardingOption", 'String'>
    readonly questionId: FieldRef<"OnboardingOption", 'String'>
    readonly value: FieldRef<"OnboardingOption", 'String'>
    readonly label: FieldRef<"OnboardingOption", 'String'>
    readonly iconSlug: FieldRef<"OnboardingOption", 'String'>
    readonly sortOrder: FieldRef<"OnboardingOption", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * OnboardingOption findUnique
   */
  export type OnboardingOptionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingOption
     */
    select?: OnboardingOptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingOption
     */
    omit?: OnboardingOptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingOptionInclude<ExtArgs> | null
    /**
     * Filter, which OnboardingOption to fetch.
     */
    where: OnboardingOptionWhereUniqueInput
  }

  /**
   * OnboardingOption findUniqueOrThrow
   */
  export type OnboardingOptionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingOption
     */
    select?: OnboardingOptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingOption
     */
    omit?: OnboardingOptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingOptionInclude<ExtArgs> | null
    /**
     * Filter, which OnboardingOption to fetch.
     */
    where: OnboardingOptionWhereUniqueInput
  }

  /**
   * OnboardingOption findFirst
   */
  export type OnboardingOptionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingOption
     */
    select?: OnboardingOptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingOption
     */
    omit?: OnboardingOptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingOptionInclude<ExtArgs> | null
    /**
     * Filter, which OnboardingOption to fetch.
     */
    where?: OnboardingOptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OnboardingOptions to fetch.
     */
    orderBy?: OnboardingOptionOrderByWithRelationInput | OnboardingOptionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OnboardingOptions.
     */
    cursor?: OnboardingOptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OnboardingOptions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OnboardingOptions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OnboardingOptions.
     */
    distinct?: OnboardingOptionScalarFieldEnum | OnboardingOptionScalarFieldEnum[]
  }

  /**
   * OnboardingOption findFirstOrThrow
   */
  export type OnboardingOptionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingOption
     */
    select?: OnboardingOptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingOption
     */
    omit?: OnboardingOptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingOptionInclude<ExtArgs> | null
    /**
     * Filter, which OnboardingOption to fetch.
     */
    where?: OnboardingOptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OnboardingOptions to fetch.
     */
    orderBy?: OnboardingOptionOrderByWithRelationInput | OnboardingOptionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OnboardingOptions.
     */
    cursor?: OnboardingOptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OnboardingOptions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OnboardingOptions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OnboardingOptions.
     */
    distinct?: OnboardingOptionScalarFieldEnum | OnboardingOptionScalarFieldEnum[]
  }

  /**
   * OnboardingOption findMany
   */
  export type OnboardingOptionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingOption
     */
    select?: OnboardingOptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingOption
     */
    omit?: OnboardingOptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingOptionInclude<ExtArgs> | null
    /**
     * Filter, which OnboardingOptions to fetch.
     */
    where?: OnboardingOptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OnboardingOptions to fetch.
     */
    orderBy?: OnboardingOptionOrderByWithRelationInput | OnboardingOptionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OnboardingOptions.
     */
    cursor?: OnboardingOptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OnboardingOptions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OnboardingOptions.
     */
    skip?: number
    distinct?: OnboardingOptionScalarFieldEnum | OnboardingOptionScalarFieldEnum[]
  }

  /**
   * OnboardingOption create
   */
  export type OnboardingOptionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingOption
     */
    select?: OnboardingOptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingOption
     */
    omit?: OnboardingOptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingOptionInclude<ExtArgs> | null
    /**
     * The data needed to create a OnboardingOption.
     */
    data: XOR<OnboardingOptionCreateInput, OnboardingOptionUncheckedCreateInput>
  }

  /**
   * OnboardingOption createMany
   */
  export type OnboardingOptionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OnboardingOptions.
     */
    data: OnboardingOptionCreateManyInput | OnboardingOptionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OnboardingOption createManyAndReturn
   */
  export type OnboardingOptionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingOption
     */
    select?: OnboardingOptionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingOption
     */
    omit?: OnboardingOptionOmit<ExtArgs> | null
    /**
     * The data used to create many OnboardingOptions.
     */
    data: OnboardingOptionCreateManyInput | OnboardingOptionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingOptionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * OnboardingOption update
   */
  export type OnboardingOptionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingOption
     */
    select?: OnboardingOptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingOption
     */
    omit?: OnboardingOptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingOptionInclude<ExtArgs> | null
    /**
     * The data needed to update a OnboardingOption.
     */
    data: XOR<OnboardingOptionUpdateInput, OnboardingOptionUncheckedUpdateInput>
    /**
     * Choose, which OnboardingOption to update.
     */
    where: OnboardingOptionWhereUniqueInput
  }

  /**
   * OnboardingOption updateMany
   */
  export type OnboardingOptionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OnboardingOptions.
     */
    data: XOR<OnboardingOptionUpdateManyMutationInput, OnboardingOptionUncheckedUpdateManyInput>
    /**
     * Filter which OnboardingOptions to update
     */
    where?: OnboardingOptionWhereInput
    /**
     * Limit how many OnboardingOptions to update.
     */
    limit?: number
  }

  /**
   * OnboardingOption updateManyAndReturn
   */
  export type OnboardingOptionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingOption
     */
    select?: OnboardingOptionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingOption
     */
    omit?: OnboardingOptionOmit<ExtArgs> | null
    /**
     * The data used to update OnboardingOptions.
     */
    data: XOR<OnboardingOptionUpdateManyMutationInput, OnboardingOptionUncheckedUpdateManyInput>
    /**
     * Filter which OnboardingOptions to update
     */
    where?: OnboardingOptionWhereInput
    /**
     * Limit how many OnboardingOptions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingOptionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * OnboardingOption upsert
   */
  export type OnboardingOptionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingOption
     */
    select?: OnboardingOptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingOption
     */
    omit?: OnboardingOptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingOptionInclude<ExtArgs> | null
    /**
     * The filter to search for the OnboardingOption to update in case it exists.
     */
    where: OnboardingOptionWhereUniqueInput
    /**
     * In case the OnboardingOption found by the `where` argument doesn't exist, create a new OnboardingOption with this data.
     */
    create: XOR<OnboardingOptionCreateInput, OnboardingOptionUncheckedCreateInput>
    /**
     * In case the OnboardingOption was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OnboardingOptionUpdateInput, OnboardingOptionUncheckedUpdateInput>
  }

  /**
   * OnboardingOption delete
   */
  export type OnboardingOptionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingOption
     */
    select?: OnboardingOptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingOption
     */
    omit?: OnboardingOptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingOptionInclude<ExtArgs> | null
    /**
     * Filter which OnboardingOption to delete.
     */
    where: OnboardingOptionWhereUniqueInput
  }

  /**
   * OnboardingOption deleteMany
   */
  export type OnboardingOptionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OnboardingOptions to delete
     */
    where?: OnboardingOptionWhereInput
    /**
     * Limit how many OnboardingOptions to delete.
     */
    limit?: number
  }

  /**
   * OnboardingOption.answers
   */
  export type OnboardingOption$answersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingAnswer
     */
    select?: OnboardingAnswerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingAnswer
     */
    omit?: OnboardingAnswerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingAnswerInclude<ExtArgs> | null
    where?: OnboardingAnswerWhereInput
    orderBy?: OnboardingAnswerOrderByWithRelationInput | OnboardingAnswerOrderByWithRelationInput[]
    cursor?: OnboardingAnswerWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OnboardingAnswerScalarFieldEnum | OnboardingAnswerScalarFieldEnum[]
  }

  /**
   * OnboardingOption without action
   */
  export type OnboardingOptionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingOption
     */
    select?: OnboardingOptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingOption
     */
    omit?: OnboardingOptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingOptionInclude<ExtArgs> | null
  }


  /**
   * Model OnboardingResponse
   */

  export type AggregateOnboardingResponse = {
    _count: OnboardingResponseCountAggregateOutputType | null
    _min: OnboardingResponseMinAggregateOutputType | null
    _max: OnboardingResponseMaxAggregateOutputType | null
  }

  export type OnboardingResponseMinAggregateOutputType = {
    id: string | null
    userId: string | null
    email: string | null
    clientFingerprint: string | null
    intentTag: $Enums.IntentTag | null
    orgSizeBracket: $Enums.OrgSizeBracket | null
    tagVersionId: string | null
    createdAt: Date | null
  }

  export type OnboardingResponseMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    email: string | null
    clientFingerprint: string | null
    intentTag: $Enums.IntentTag | null
    orgSizeBracket: $Enums.OrgSizeBracket | null
    tagVersionId: string | null
    createdAt: Date | null
  }

  export type OnboardingResponseCountAggregateOutputType = {
    id: number
    userId: number
    email: number
    clientFingerprint: number
    intentTag: number
    orgSizeBracket: number
    tagVersionId: number
    createdAt: number
    _all: number
  }


  export type OnboardingResponseMinAggregateInputType = {
    id?: true
    userId?: true
    email?: true
    clientFingerprint?: true
    intentTag?: true
    orgSizeBracket?: true
    tagVersionId?: true
    createdAt?: true
  }

  export type OnboardingResponseMaxAggregateInputType = {
    id?: true
    userId?: true
    email?: true
    clientFingerprint?: true
    intentTag?: true
    orgSizeBracket?: true
    tagVersionId?: true
    createdAt?: true
  }

  export type OnboardingResponseCountAggregateInputType = {
    id?: true
    userId?: true
    email?: true
    clientFingerprint?: true
    intentTag?: true
    orgSizeBracket?: true
    tagVersionId?: true
    createdAt?: true
    _all?: true
  }

  export type OnboardingResponseAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OnboardingResponse to aggregate.
     */
    where?: OnboardingResponseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OnboardingResponses to fetch.
     */
    orderBy?: OnboardingResponseOrderByWithRelationInput | OnboardingResponseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OnboardingResponseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OnboardingResponses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OnboardingResponses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OnboardingResponses
    **/
    _count?: true | OnboardingResponseCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OnboardingResponseMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OnboardingResponseMaxAggregateInputType
  }

  export type GetOnboardingResponseAggregateType<T extends OnboardingResponseAggregateArgs> = {
        [P in keyof T & keyof AggregateOnboardingResponse]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOnboardingResponse[P]>
      : GetScalarType<T[P], AggregateOnboardingResponse[P]>
  }




  export type OnboardingResponseGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OnboardingResponseWhereInput
    orderBy?: OnboardingResponseOrderByWithAggregationInput | OnboardingResponseOrderByWithAggregationInput[]
    by: OnboardingResponseScalarFieldEnum[] | OnboardingResponseScalarFieldEnum
    having?: OnboardingResponseScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OnboardingResponseCountAggregateInputType | true
    _min?: OnboardingResponseMinAggregateInputType
    _max?: OnboardingResponseMaxAggregateInputType
  }

  export type OnboardingResponseGroupByOutputType = {
    id: string
    userId: string
    email: string
    clientFingerprint: string
    intentTag: $Enums.IntentTag
    orgSizeBracket: $Enums.OrgSizeBracket
    tagVersionId: string
    createdAt: Date
    _count: OnboardingResponseCountAggregateOutputType | null
    _min: OnboardingResponseMinAggregateOutputType | null
    _max: OnboardingResponseMaxAggregateOutputType | null
  }

  type GetOnboardingResponseGroupByPayload<T extends OnboardingResponseGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OnboardingResponseGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OnboardingResponseGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OnboardingResponseGroupByOutputType[P]>
            : GetScalarType<T[P], OnboardingResponseGroupByOutputType[P]>
        }
      >
    >


  export type OnboardingResponseSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    email?: boolean
    clientFingerprint?: boolean
    intentTag?: boolean
    orgSizeBracket?: boolean
    tagVersionId?: boolean
    createdAt?: boolean
    tagVersion?: boolean | OnboardingTagVersionDefaultArgs<ExtArgs>
    answers?: boolean | OnboardingResponse$answersArgs<ExtArgs>
    _count?: boolean | OnboardingResponseCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["onboardingResponse"]>

  export type OnboardingResponseSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    email?: boolean
    clientFingerprint?: boolean
    intentTag?: boolean
    orgSizeBracket?: boolean
    tagVersionId?: boolean
    createdAt?: boolean
    tagVersion?: boolean | OnboardingTagVersionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["onboardingResponse"]>

  export type OnboardingResponseSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    email?: boolean
    clientFingerprint?: boolean
    intentTag?: boolean
    orgSizeBracket?: boolean
    tagVersionId?: boolean
    createdAt?: boolean
    tagVersion?: boolean | OnboardingTagVersionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["onboardingResponse"]>

  export type OnboardingResponseSelectScalar = {
    id?: boolean
    userId?: boolean
    email?: boolean
    clientFingerprint?: boolean
    intentTag?: boolean
    orgSizeBracket?: boolean
    tagVersionId?: boolean
    createdAt?: boolean
  }

  export type OnboardingResponseOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "email" | "clientFingerprint" | "intentTag" | "orgSizeBracket" | "tagVersionId" | "createdAt", ExtArgs["result"]["onboardingResponse"]>
  export type OnboardingResponseInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tagVersion?: boolean | OnboardingTagVersionDefaultArgs<ExtArgs>
    answers?: boolean | OnboardingResponse$answersArgs<ExtArgs>
    _count?: boolean | OnboardingResponseCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type OnboardingResponseIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tagVersion?: boolean | OnboardingTagVersionDefaultArgs<ExtArgs>
  }
  export type OnboardingResponseIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tagVersion?: boolean | OnboardingTagVersionDefaultArgs<ExtArgs>
  }

  export type $OnboardingResponsePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OnboardingResponse"
    objects: {
      tagVersion: Prisma.$OnboardingTagVersionPayload<ExtArgs>
      answers: Prisma.$OnboardingAnswerPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      email: string
      clientFingerprint: string
      intentTag: $Enums.IntentTag
      orgSizeBracket: $Enums.OrgSizeBracket
      tagVersionId: string
      createdAt: Date
    }, ExtArgs["result"]["onboardingResponse"]>
    composites: {}
  }

  type OnboardingResponseGetPayload<S extends boolean | null | undefined | OnboardingResponseDefaultArgs> = $Result.GetResult<Prisma.$OnboardingResponsePayload, S>

  type OnboardingResponseCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OnboardingResponseFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OnboardingResponseCountAggregateInputType | true
    }

  export interface OnboardingResponseDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OnboardingResponse'], meta: { name: 'OnboardingResponse' } }
    /**
     * Find zero or one OnboardingResponse that matches the filter.
     * @param {OnboardingResponseFindUniqueArgs} args - Arguments to find a OnboardingResponse
     * @example
     * // Get one OnboardingResponse
     * const onboardingResponse = await prisma.onboardingResponse.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OnboardingResponseFindUniqueArgs>(args: SelectSubset<T, OnboardingResponseFindUniqueArgs<ExtArgs>>): Prisma__OnboardingResponseClient<$Result.GetResult<Prisma.$OnboardingResponsePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one OnboardingResponse that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OnboardingResponseFindUniqueOrThrowArgs} args - Arguments to find a OnboardingResponse
     * @example
     * // Get one OnboardingResponse
     * const onboardingResponse = await prisma.onboardingResponse.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OnboardingResponseFindUniqueOrThrowArgs>(args: SelectSubset<T, OnboardingResponseFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OnboardingResponseClient<$Result.GetResult<Prisma.$OnboardingResponsePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OnboardingResponse that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingResponseFindFirstArgs} args - Arguments to find a OnboardingResponse
     * @example
     * // Get one OnboardingResponse
     * const onboardingResponse = await prisma.onboardingResponse.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OnboardingResponseFindFirstArgs>(args?: SelectSubset<T, OnboardingResponseFindFirstArgs<ExtArgs>>): Prisma__OnboardingResponseClient<$Result.GetResult<Prisma.$OnboardingResponsePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OnboardingResponse that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingResponseFindFirstOrThrowArgs} args - Arguments to find a OnboardingResponse
     * @example
     * // Get one OnboardingResponse
     * const onboardingResponse = await prisma.onboardingResponse.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OnboardingResponseFindFirstOrThrowArgs>(args?: SelectSubset<T, OnboardingResponseFindFirstOrThrowArgs<ExtArgs>>): Prisma__OnboardingResponseClient<$Result.GetResult<Prisma.$OnboardingResponsePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more OnboardingResponses that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingResponseFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OnboardingResponses
     * const onboardingResponses = await prisma.onboardingResponse.findMany()
     * 
     * // Get first 10 OnboardingResponses
     * const onboardingResponses = await prisma.onboardingResponse.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const onboardingResponseWithIdOnly = await prisma.onboardingResponse.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OnboardingResponseFindManyArgs>(args?: SelectSubset<T, OnboardingResponseFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OnboardingResponsePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a OnboardingResponse.
     * @param {OnboardingResponseCreateArgs} args - Arguments to create a OnboardingResponse.
     * @example
     * // Create one OnboardingResponse
     * const OnboardingResponse = await prisma.onboardingResponse.create({
     *   data: {
     *     // ... data to create a OnboardingResponse
     *   }
     * })
     * 
     */
    create<T extends OnboardingResponseCreateArgs>(args: SelectSubset<T, OnboardingResponseCreateArgs<ExtArgs>>): Prisma__OnboardingResponseClient<$Result.GetResult<Prisma.$OnboardingResponsePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many OnboardingResponses.
     * @param {OnboardingResponseCreateManyArgs} args - Arguments to create many OnboardingResponses.
     * @example
     * // Create many OnboardingResponses
     * const onboardingResponse = await prisma.onboardingResponse.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OnboardingResponseCreateManyArgs>(args?: SelectSubset<T, OnboardingResponseCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many OnboardingResponses and returns the data saved in the database.
     * @param {OnboardingResponseCreateManyAndReturnArgs} args - Arguments to create many OnboardingResponses.
     * @example
     * // Create many OnboardingResponses
     * const onboardingResponse = await prisma.onboardingResponse.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many OnboardingResponses and only return the `id`
     * const onboardingResponseWithIdOnly = await prisma.onboardingResponse.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OnboardingResponseCreateManyAndReturnArgs>(args?: SelectSubset<T, OnboardingResponseCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OnboardingResponsePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a OnboardingResponse.
     * @param {OnboardingResponseDeleteArgs} args - Arguments to delete one OnboardingResponse.
     * @example
     * // Delete one OnboardingResponse
     * const OnboardingResponse = await prisma.onboardingResponse.delete({
     *   where: {
     *     // ... filter to delete one OnboardingResponse
     *   }
     * })
     * 
     */
    delete<T extends OnboardingResponseDeleteArgs>(args: SelectSubset<T, OnboardingResponseDeleteArgs<ExtArgs>>): Prisma__OnboardingResponseClient<$Result.GetResult<Prisma.$OnboardingResponsePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one OnboardingResponse.
     * @param {OnboardingResponseUpdateArgs} args - Arguments to update one OnboardingResponse.
     * @example
     * // Update one OnboardingResponse
     * const onboardingResponse = await prisma.onboardingResponse.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OnboardingResponseUpdateArgs>(args: SelectSubset<T, OnboardingResponseUpdateArgs<ExtArgs>>): Prisma__OnboardingResponseClient<$Result.GetResult<Prisma.$OnboardingResponsePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more OnboardingResponses.
     * @param {OnboardingResponseDeleteManyArgs} args - Arguments to filter OnboardingResponses to delete.
     * @example
     * // Delete a few OnboardingResponses
     * const { count } = await prisma.onboardingResponse.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OnboardingResponseDeleteManyArgs>(args?: SelectSubset<T, OnboardingResponseDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OnboardingResponses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingResponseUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OnboardingResponses
     * const onboardingResponse = await prisma.onboardingResponse.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OnboardingResponseUpdateManyArgs>(args: SelectSubset<T, OnboardingResponseUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OnboardingResponses and returns the data updated in the database.
     * @param {OnboardingResponseUpdateManyAndReturnArgs} args - Arguments to update many OnboardingResponses.
     * @example
     * // Update many OnboardingResponses
     * const onboardingResponse = await prisma.onboardingResponse.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more OnboardingResponses and only return the `id`
     * const onboardingResponseWithIdOnly = await prisma.onboardingResponse.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends OnboardingResponseUpdateManyAndReturnArgs>(args: SelectSubset<T, OnboardingResponseUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OnboardingResponsePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one OnboardingResponse.
     * @param {OnboardingResponseUpsertArgs} args - Arguments to update or create a OnboardingResponse.
     * @example
     * // Update or create a OnboardingResponse
     * const onboardingResponse = await prisma.onboardingResponse.upsert({
     *   create: {
     *     // ... data to create a OnboardingResponse
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OnboardingResponse we want to update
     *   }
     * })
     */
    upsert<T extends OnboardingResponseUpsertArgs>(args: SelectSubset<T, OnboardingResponseUpsertArgs<ExtArgs>>): Prisma__OnboardingResponseClient<$Result.GetResult<Prisma.$OnboardingResponsePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of OnboardingResponses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingResponseCountArgs} args - Arguments to filter OnboardingResponses to count.
     * @example
     * // Count the number of OnboardingResponses
     * const count = await prisma.onboardingResponse.count({
     *   where: {
     *     // ... the filter for the OnboardingResponses we want to count
     *   }
     * })
    **/
    count<T extends OnboardingResponseCountArgs>(
      args?: Subset<T, OnboardingResponseCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OnboardingResponseCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OnboardingResponse.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingResponseAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OnboardingResponseAggregateArgs>(args: Subset<T, OnboardingResponseAggregateArgs>): Prisma.PrismaPromise<GetOnboardingResponseAggregateType<T>>

    /**
     * Group by OnboardingResponse.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingResponseGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OnboardingResponseGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OnboardingResponseGroupByArgs['orderBy'] }
        : { orderBy?: OnboardingResponseGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OnboardingResponseGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOnboardingResponseGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OnboardingResponse model
   */
  readonly fields: OnboardingResponseFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OnboardingResponse.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OnboardingResponseClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tagVersion<T extends OnboardingTagVersionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OnboardingTagVersionDefaultArgs<ExtArgs>>): Prisma__OnboardingTagVersionClient<$Result.GetResult<Prisma.$OnboardingTagVersionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    answers<T extends OnboardingResponse$answersArgs<ExtArgs> = {}>(args?: Subset<T, OnboardingResponse$answersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OnboardingAnswerPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the OnboardingResponse model
   */
  interface OnboardingResponseFieldRefs {
    readonly id: FieldRef<"OnboardingResponse", 'String'>
    readonly userId: FieldRef<"OnboardingResponse", 'String'>
    readonly email: FieldRef<"OnboardingResponse", 'String'>
    readonly clientFingerprint: FieldRef<"OnboardingResponse", 'String'>
    readonly intentTag: FieldRef<"OnboardingResponse", 'IntentTag'>
    readonly orgSizeBracket: FieldRef<"OnboardingResponse", 'OrgSizeBracket'>
    readonly tagVersionId: FieldRef<"OnboardingResponse", 'String'>
    readonly createdAt: FieldRef<"OnboardingResponse", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * OnboardingResponse findUnique
   */
  export type OnboardingResponseFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingResponse
     */
    select?: OnboardingResponseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingResponse
     */
    omit?: OnboardingResponseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingResponseInclude<ExtArgs> | null
    /**
     * Filter, which OnboardingResponse to fetch.
     */
    where: OnboardingResponseWhereUniqueInput
  }

  /**
   * OnboardingResponse findUniqueOrThrow
   */
  export type OnboardingResponseFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingResponse
     */
    select?: OnboardingResponseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingResponse
     */
    omit?: OnboardingResponseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingResponseInclude<ExtArgs> | null
    /**
     * Filter, which OnboardingResponse to fetch.
     */
    where: OnboardingResponseWhereUniqueInput
  }

  /**
   * OnboardingResponse findFirst
   */
  export type OnboardingResponseFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingResponse
     */
    select?: OnboardingResponseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingResponse
     */
    omit?: OnboardingResponseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingResponseInclude<ExtArgs> | null
    /**
     * Filter, which OnboardingResponse to fetch.
     */
    where?: OnboardingResponseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OnboardingResponses to fetch.
     */
    orderBy?: OnboardingResponseOrderByWithRelationInput | OnboardingResponseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OnboardingResponses.
     */
    cursor?: OnboardingResponseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OnboardingResponses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OnboardingResponses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OnboardingResponses.
     */
    distinct?: OnboardingResponseScalarFieldEnum | OnboardingResponseScalarFieldEnum[]
  }

  /**
   * OnboardingResponse findFirstOrThrow
   */
  export type OnboardingResponseFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingResponse
     */
    select?: OnboardingResponseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingResponse
     */
    omit?: OnboardingResponseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingResponseInclude<ExtArgs> | null
    /**
     * Filter, which OnboardingResponse to fetch.
     */
    where?: OnboardingResponseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OnboardingResponses to fetch.
     */
    orderBy?: OnboardingResponseOrderByWithRelationInput | OnboardingResponseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OnboardingResponses.
     */
    cursor?: OnboardingResponseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OnboardingResponses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OnboardingResponses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OnboardingResponses.
     */
    distinct?: OnboardingResponseScalarFieldEnum | OnboardingResponseScalarFieldEnum[]
  }

  /**
   * OnboardingResponse findMany
   */
  export type OnboardingResponseFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingResponse
     */
    select?: OnboardingResponseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingResponse
     */
    omit?: OnboardingResponseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingResponseInclude<ExtArgs> | null
    /**
     * Filter, which OnboardingResponses to fetch.
     */
    where?: OnboardingResponseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OnboardingResponses to fetch.
     */
    orderBy?: OnboardingResponseOrderByWithRelationInput | OnboardingResponseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OnboardingResponses.
     */
    cursor?: OnboardingResponseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OnboardingResponses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OnboardingResponses.
     */
    skip?: number
    distinct?: OnboardingResponseScalarFieldEnum | OnboardingResponseScalarFieldEnum[]
  }

  /**
   * OnboardingResponse create
   */
  export type OnboardingResponseCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingResponse
     */
    select?: OnboardingResponseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingResponse
     */
    omit?: OnboardingResponseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingResponseInclude<ExtArgs> | null
    /**
     * The data needed to create a OnboardingResponse.
     */
    data: XOR<OnboardingResponseCreateInput, OnboardingResponseUncheckedCreateInput>
  }

  /**
   * OnboardingResponse createMany
   */
  export type OnboardingResponseCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OnboardingResponses.
     */
    data: OnboardingResponseCreateManyInput | OnboardingResponseCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OnboardingResponse createManyAndReturn
   */
  export type OnboardingResponseCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingResponse
     */
    select?: OnboardingResponseSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingResponse
     */
    omit?: OnboardingResponseOmit<ExtArgs> | null
    /**
     * The data used to create many OnboardingResponses.
     */
    data: OnboardingResponseCreateManyInput | OnboardingResponseCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingResponseIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * OnboardingResponse update
   */
  export type OnboardingResponseUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingResponse
     */
    select?: OnboardingResponseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingResponse
     */
    omit?: OnboardingResponseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingResponseInclude<ExtArgs> | null
    /**
     * The data needed to update a OnboardingResponse.
     */
    data: XOR<OnboardingResponseUpdateInput, OnboardingResponseUncheckedUpdateInput>
    /**
     * Choose, which OnboardingResponse to update.
     */
    where: OnboardingResponseWhereUniqueInput
  }

  /**
   * OnboardingResponse updateMany
   */
  export type OnboardingResponseUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OnboardingResponses.
     */
    data: XOR<OnboardingResponseUpdateManyMutationInput, OnboardingResponseUncheckedUpdateManyInput>
    /**
     * Filter which OnboardingResponses to update
     */
    where?: OnboardingResponseWhereInput
    /**
     * Limit how many OnboardingResponses to update.
     */
    limit?: number
  }

  /**
   * OnboardingResponse updateManyAndReturn
   */
  export type OnboardingResponseUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingResponse
     */
    select?: OnboardingResponseSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingResponse
     */
    omit?: OnboardingResponseOmit<ExtArgs> | null
    /**
     * The data used to update OnboardingResponses.
     */
    data: XOR<OnboardingResponseUpdateManyMutationInput, OnboardingResponseUncheckedUpdateManyInput>
    /**
     * Filter which OnboardingResponses to update
     */
    where?: OnboardingResponseWhereInput
    /**
     * Limit how many OnboardingResponses to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingResponseIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * OnboardingResponse upsert
   */
  export type OnboardingResponseUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingResponse
     */
    select?: OnboardingResponseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingResponse
     */
    omit?: OnboardingResponseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingResponseInclude<ExtArgs> | null
    /**
     * The filter to search for the OnboardingResponse to update in case it exists.
     */
    where: OnboardingResponseWhereUniqueInput
    /**
     * In case the OnboardingResponse found by the `where` argument doesn't exist, create a new OnboardingResponse with this data.
     */
    create: XOR<OnboardingResponseCreateInput, OnboardingResponseUncheckedCreateInput>
    /**
     * In case the OnboardingResponse was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OnboardingResponseUpdateInput, OnboardingResponseUncheckedUpdateInput>
  }

  /**
   * OnboardingResponse delete
   */
  export type OnboardingResponseDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingResponse
     */
    select?: OnboardingResponseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingResponse
     */
    omit?: OnboardingResponseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingResponseInclude<ExtArgs> | null
    /**
     * Filter which OnboardingResponse to delete.
     */
    where: OnboardingResponseWhereUniqueInput
  }

  /**
   * OnboardingResponse deleteMany
   */
  export type OnboardingResponseDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OnboardingResponses to delete
     */
    where?: OnboardingResponseWhereInput
    /**
     * Limit how many OnboardingResponses to delete.
     */
    limit?: number
  }

  /**
   * OnboardingResponse.answers
   */
  export type OnboardingResponse$answersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingAnswer
     */
    select?: OnboardingAnswerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingAnswer
     */
    omit?: OnboardingAnswerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingAnswerInclude<ExtArgs> | null
    where?: OnboardingAnswerWhereInput
    orderBy?: OnboardingAnswerOrderByWithRelationInput | OnboardingAnswerOrderByWithRelationInput[]
    cursor?: OnboardingAnswerWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OnboardingAnswerScalarFieldEnum | OnboardingAnswerScalarFieldEnum[]
  }

  /**
   * OnboardingResponse without action
   */
  export type OnboardingResponseDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingResponse
     */
    select?: OnboardingResponseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingResponse
     */
    omit?: OnboardingResponseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingResponseInclude<ExtArgs> | null
  }


  /**
   * Model OnboardingAnswer
   */

  export type AggregateOnboardingAnswer = {
    _count: OnboardingAnswerCountAggregateOutputType | null
    _min: OnboardingAnswerMinAggregateOutputType | null
    _max: OnboardingAnswerMaxAggregateOutputType | null
  }

  export type OnboardingAnswerMinAggregateOutputType = {
    id: string | null
    responseId: string | null
    questionId: string | null
    optionId: string | null
    customValue: string | null
  }

  export type OnboardingAnswerMaxAggregateOutputType = {
    id: string | null
    responseId: string | null
    questionId: string | null
    optionId: string | null
    customValue: string | null
  }

  export type OnboardingAnswerCountAggregateOutputType = {
    id: number
    responseId: number
    questionId: number
    optionId: number
    customValue: number
    _all: number
  }


  export type OnboardingAnswerMinAggregateInputType = {
    id?: true
    responseId?: true
    questionId?: true
    optionId?: true
    customValue?: true
  }

  export type OnboardingAnswerMaxAggregateInputType = {
    id?: true
    responseId?: true
    questionId?: true
    optionId?: true
    customValue?: true
  }

  export type OnboardingAnswerCountAggregateInputType = {
    id?: true
    responseId?: true
    questionId?: true
    optionId?: true
    customValue?: true
    _all?: true
  }

  export type OnboardingAnswerAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OnboardingAnswer to aggregate.
     */
    where?: OnboardingAnswerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OnboardingAnswers to fetch.
     */
    orderBy?: OnboardingAnswerOrderByWithRelationInput | OnboardingAnswerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OnboardingAnswerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OnboardingAnswers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OnboardingAnswers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OnboardingAnswers
    **/
    _count?: true | OnboardingAnswerCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OnboardingAnswerMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OnboardingAnswerMaxAggregateInputType
  }

  export type GetOnboardingAnswerAggregateType<T extends OnboardingAnswerAggregateArgs> = {
        [P in keyof T & keyof AggregateOnboardingAnswer]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOnboardingAnswer[P]>
      : GetScalarType<T[P], AggregateOnboardingAnswer[P]>
  }




  export type OnboardingAnswerGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OnboardingAnswerWhereInput
    orderBy?: OnboardingAnswerOrderByWithAggregationInput | OnboardingAnswerOrderByWithAggregationInput[]
    by: OnboardingAnswerScalarFieldEnum[] | OnboardingAnswerScalarFieldEnum
    having?: OnboardingAnswerScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OnboardingAnswerCountAggregateInputType | true
    _min?: OnboardingAnswerMinAggregateInputType
    _max?: OnboardingAnswerMaxAggregateInputType
  }

  export type OnboardingAnswerGroupByOutputType = {
    id: string
    responseId: string
    questionId: string
    optionId: string | null
    customValue: string | null
    _count: OnboardingAnswerCountAggregateOutputType | null
    _min: OnboardingAnswerMinAggregateOutputType | null
    _max: OnboardingAnswerMaxAggregateOutputType | null
  }

  type GetOnboardingAnswerGroupByPayload<T extends OnboardingAnswerGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OnboardingAnswerGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OnboardingAnswerGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OnboardingAnswerGroupByOutputType[P]>
            : GetScalarType<T[P], OnboardingAnswerGroupByOutputType[P]>
        }
      >
    >


  export type OnboardingAnswerSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    responseId?: boolean
    questionId?: boolean
    optionId?: boolean
    customValue?: boolean
    response?: boolean | OnboardingResponseDefaultArgs<ExtArgs>
    question?: boolean | OnboardingQuestionDefaultArgs<ExtArgs>
    option?: boolean | OnboardingAnswer$optionArgs<ExtArgs>
  }, ExtArgs["result"]["onboardingAnswer"]>

  export type OnboardingAnswerSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    responseId?: boolean
    questionId?: boolean
    optionId?: boolean
    customValue?: boolean
    response?: boolean | OnboardingResponseDefaultArgs<ExtArgs>
    question?: boolean | OnboardingQuestionDefaultArgs<ExtArgs>
    option?: boolean | OnboardingAnswer$optionArgs<ExtArgs>
  }, ExtArgs["result"]["onboardingAnswer"]>

  export type OnboardingAnswerSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    responseId?: boolean
    questionId?: boolean
    optionId?: boolean
    customValue?: boolean
    response?: boolean | OnboardingResponseDefaultArgs<ExtArgs>
    question?: boolean | OnboardingQuestionDefaultArgs<ExtArgs>
    option?: boolean | OnboardingAnswer$optionArgs<ExtArgs>
  }, ExtArgs["result"]["onboardingAnswer"]>

  export type OnboardingAnswerSelectScalar = {
    id?: boolean
    responseId?: boolean
    questionId?: boolean
    optionId?: boolean
    customValue?: boolean
  }

  export type OnboardingAnswerOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "responseId" | "questionId" | "optionId" | "customValue", ExtArgs["result"]["onboardingAnswer"]>
  export type OnboardingAnswerInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    response?: boolean | OnboardingResponseDefaultArgs<ExtArgs>
    question?: boolean | OnboardingQuestionDefaultArgs<ExtArgs>
    option?: boolean | OnboardingAnswer$optionArgs<ExtArgs>
  }
  export type OnboardingAnswerIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    response?: boolean | OnboardingResponseDefaultArgs<ExtArgs>
    question?: boolean | OnboardingQuestionDefaultArgs<ExtArgs>
    option?: boolean | OnboardingAnswer$optionArgs<ExtArgs>
  }
  export type OnboardingAnswerIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    response?: boolean | OnboardingResponseDefaultArgs<ExtArgs>
    question?: boolean | OnboardingQuestionDefaultArgs<ExtArgs>
    option?: boolean | OnboardingAnswer$optionArgs<ExtArgs>
  }

  export type $OnboardingAnswerPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OnboardingAnswer"
    objects: {
      response: Prisma.$OnboardingResponsePayload<ExtArgs>
      question: Prisma.$OnboardingQuestionPayload<ExtArgs>
      option: Prisma.$OnboardingOptionPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      responseId: string
      questionId: string
      optionId: string | null
      customValue: string | null
    }, ExtArgs["result"]["onboardingAnswer"]>
    composites: {}
  }

  type OnboardingAnswerGetPayload<S extends boolean | null | undefined | OnboardingAnswerDefaultArgs> = $Result.GetResult<Prisma.$OnboardingAnswerPayload, S>

  type OnboardingAnswerCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OnboardingAnswerFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OnboardingAnswerCountAggregateInputType | true
    }

  export interface OnboardingAnswerDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OnboardingAnswer'], meta: { name: 'OnboardingAnswer' } }
    /**
     * Find zero or one OnboardingAnswer that matches the filter.
     * @param {OnboardingAnswerFindUniqueArgs} args - Arguments to find a OnboardingAnswer
     * @example
     * // Get one OnboardingAnswer
     * const onboardingAnswer = await prisma.onboardingAnswer.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OnboardingAnswerFindUniqueArgs>(args: SelectSubset<T, OnboardingAnswerFindUniqueArgs<ExtArgs>>): Prisma__OnboardingAnswerClient<$Result.GetResult<Prisma.$OnboardingAnswerPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one OnboardingAnswer that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OnboardingAnswerFindUniqueOrThrowArgs} args - Arguments to find a OnboardingAnswer
     * @example
     * // Get one OnboardingAnswer
     * const onboardingAnswer = await prisma.onboardingAnswer.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OnboardingAnswerFindUniqueOrThrowArgs>(args: SelectSubset<T, OnboardingAnswerFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OnboardingAnswerClient<$Result.GetResult<Prisma.$OnboardingAnswerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OnboardingAnswer that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingAnswerFindFirstArgs} args - Arguments to find a OnboardingAnswer
     * @example
     * // Get one OnboardingAnswer
     * const onboardingAnswer = await prisma.onboardingAnswer.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OnboardingAnswerFindFirstArgs>(args?: SelectSubset<T, OnboardingAnswerFindFirstArgs<ExtArgs>>): Prisma__OnboardingAnswerClient<$Result.GetResult<Prisma.$OnboardingAnswerPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OnboardingAnswer that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingAnswerFindFirstOrThrowArgs} args - Arguments to find a OnboardingAnswer
     * @example
     * // Get one OnboardingAnswer
     * const onboardingAnswer = await prisma.onboardingAnswer.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OnboardingAnswerFindFirstOrThrowArgs>(args?: SelectSubset<T, OnboardingAnswerFindFirstOrThrowArgs<ExtArgs>>): Prisma__OnboardingAnswerClient<$Result.GetResult<Prisma.$OnboardingAnswerPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more OnboardingAnswers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingAnswerFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OnboardingAnswers
     * const onboardingAnswers = await prisma.onboardingAnswer.findMany()
     * 
     * // Get first 10 OnboardingAnswers
     * const onboardingAnswers = await prisma.onboardingAnswer.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const onboardingAnswerWithIdOnly = await prisma.onboardingAnswer.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OnboardingAnswerFindManyArgs>(args?: SelectSubset<T, OnboardingAnswerFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OnboardingAnswerPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a OnboardingAnswer.
     * @param {OnboardingAnswerCreateArgs} args - Arguments to create a OnboardingAnswer.
     * @example
     * // Create one OnboardingAnswer
     * const OnboardingAnswer = await prisma.onboardingAnswer.create({
     *   data: {
     *     // ... data to create a OnboardingAnswer
     *   }
     * })
     * 
     */
    create<T extends OnboardingAnswerCreateArgs>(args: SelectSubset<T, OnboardingAnswerCreateArgs<ExtArgs>>): Prisma__OnboardingAnswerClient<$Result.GetResult<Prisma.$OnboardingAnswerPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many OnboardingAnswers.
     * @param {OnboardingAnswerCreateManyArgs} args - Arguments to create many OnboardingAnswers.
     * @example
     * // Create many OnboardingAnswers
     * const onboardingAnswer = await prisma.onboardingAnswer.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OnboardingAnswerCreateManyArgs>(args?: SelectSubset<T, OnboardingAnswerCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many OnboardingAnswers and returns the data saved in the database.
     * @param {OnboardingAnswerCreateManyAndReturnArgs} args - Arguments to create many OnboardingAnswers.
     * @example
     * // Create many OnboardingAnswers
     * const onboardingAnswer = await prisma.onboardingAnswer.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many OnboardingAnswers and only return the `id`
     * const onboardingAnswerWithIdOnly = await prisma.onboardingAnswer.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OnboardingAnswerCreateManyAndReturnArgs>(args?: SelectSubset<T, OnboardingAnswerCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OnboardingAnswerPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a OnboardingAnswer.
     * @param {OnboardingAnswerDeleteArgs} args - Arguments to delete one OnboardingAnswer.
     * @example
     * // Delete one OnboardingAnswer
     * const OnboardingAnswer = await prisma.onboardingAnswer.delete({
     *   where: {
     *     // ... filter to delete one OnboardingAnswer
     *   }
     * })
     * 
     */
    delete<T extends OnboardingAnswerDeleteArgs>(args: SelectSubset<T, OnboardingAnswerDeleteArgs<ExtArgs>>): Prisma__OnboardingAnswerClient<$Result.GetResult<Prisma.$OnboardingAnswerPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one OnboardingAnswer.
     * @param {OnboardingAnswerUpdateArgs} args - Arguments to update one OnboardingAnswer.
     * @example
     * // Update one OnboardingAnswer
     * const onboardingAnswer = await prisma.onboardingAnswer.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OnboardingAnswerUpdateArgs>(args: SelectSubset<T, OnboardingAnswerUpdateArgs<ExtArgs>>): Prisma__OnboardingAnswerClient<$Result.GetResult<Prisma.$OnboardingAnswerPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more OnboardingAnswers.
     * @param {OnboardingAnswerDeleteManyArgs} args - Arguments to filter OnboardingAnswers to delete.
     * @example
     * // Delete a few OnboardingAnswers
     * const { count } = await prisma.onboardingAnswer.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OnboardingAnswerDeleteManyArgs>(args?: SelectSubset<T, OnboardingAnswerDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OnboardingAnswers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingAnswerUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OnboardingAnswers
     * const onboardingAnswer = await prisma.onboardingAnswer.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OnboardingAnswerUpdateManyArgs>(args: SelectSubset<T, OnboardingAnswerUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OnboardingAnswers and returns the data updated in the database.
     * @param {OnboardingAnswerUpdateManyAndReturnArgs} args - Arguments to update many OnboardingAnswers.
     * @example
     * // Update many OnboardingAnswers
     * const onboardingAnswer = await prisma.onboardingAnswer.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more OnboardingAnswers and only return the `id`
     * const onboardingAnswerWithIdOnly = await prisma.onboardingAnswer.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends OnboardingAnswerUpdateManyAndReturnArgs>(args: SelectSubset<T, OnboardingAnswerUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OnboardingAnswerPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one OnboardingAnswer.
     * @param {OnboardingAnswerUpsertArgs} args - Arguments to update or create a OnboardingAnswer.
     * @example
     * // Update or create a OnboardingAnswer
     * const onboardingAnswer = await prisma.onboardingAnswer.upsert({
     *   create: {
     *     // ... data to create a OnboardingAnswer
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OnboardingAnswer we want to update
     *   }
     * })
     */
    upsert<T extends OnboardingAnswerUpsertArgs>(args: SelectSubset<T, OnboardingAnswerUpsertArgs<ExtArgs>>): Prisma__OnboardingAnswerClient<$Result.GetResult<Prisma.$OnboardingAnswerPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of OnboardingAnswers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingAnswerCountArgs} args - Arguments to filter OnboardingAnswers to count.
     * @example
     * // Count the number of OnboardingAnswers
     * const count = await prisma.onboardingAnswer.count({
     *   where: {
     *     // ... the filter for the OnboardingAnswers we want to count
     *   }
     * })
    **/
    count<T extends OnboardingAnswerCountArgs>(
      args?: Subset<T, OnboardingAnswerCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OnboardingAnswerCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OnboardingAnswer.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingAnswerAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OnboardingAnswerAggregateArgs>(args: Subset<T, OnboardingAnswerAggregateArgs>): Prisma.PrismaPromise<GetOnboardingAnswerAggregateType<T>>

    /**
     * Group by OnboardingAnswer.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OnboardingAnswerGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OnboardingAnswerGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OnboardingAnswerGroupByArgs['orderBy'] }
        : { orderBy?: OnboardingAnswerGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OnboardingAnswerGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOnboardingAnswerGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OnboardingAnswer model
   */
  readonly fields: OnboardingAnswerFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OnboardingAnswer.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OnboardingAnswerClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    response<T extends OnboardingResponseDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OnboardingResponseDefaultArgs<ExtArgs>>): Prisma__OnboardingResponseClient<$Result.GetResult<Prisma.$OnboardingResponsePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    question<T extends OnboardingQuestionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OnboardingQuestionDefaultArgs<ExtArgs>>): Prisma__OnboardingQuestionClient<$Result.GetResult<Prisma.$OnboardingQuestionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    option<T extends OnboardingAnswer$optionArgs<ExtArgs> = {}>(args?: Subset<T, OnboardingAnswer$optionArgs<ExtArgs>>): Prisma__OnboardingOptionClient<$Result.GetResult<Prisma.$OnboardingOptionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the OnboardingAnswer model
   */
  interface OnboardingAnswerFieldRefs {
    readonly id: FieldRef<"OnboardingAnswer", 'String'>
    readonly responseId: FieldRef<"OnboardingAnswer", 'String'>
    readonly questionId: FieldRef<"OnboardingAnswer", 'String'>
    readonly optionId: FieldRef<"OnboardingAnswer", 'String'>
    readonly customValue: FieldRef<"OnboardingAnswer", 'String'>
  }
    

  // Custom InputTypes
  /**
   * OnboardingAnswer findUnique
   */
  export type OnboardingAnswerFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingAnswer
     */
    select?: OnboardingAnswerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingAnswer
     */
    omit?: OnboardingAnswerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingAnswerInclude<ExtArgs> | null
    /**
     * Filter, which OnboardingAnswer to fetch.
     */
    where: OnboardingAnswerWhereUniqueInput
  }

  /**
   * OnboardingAnswer findUniqueOrThrow
   */
  export type OnboardingAnswerFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingAnswer
     */
    select?: OnboardingAnswerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingAnswer
     */
    omit?: OnboardingAnswerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingAnswerInclude<ExtArgs> | null
    /**
     * Filter, which OnboardingAnswer to fetch.
     */
    where: OnboardingAnswerWhereUniqueInput
  }

  /**
   * OnboardingAnswer findFirst
   */
  export type OnboardingAnswerFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingAnswer
     */
    select?: OnboardingAnswerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingAnswer
     */
    omit?: OnboardingAnswerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingAnswerInclude<ExtArgs> | null
    /**
     * Filter, which OnboardingAnswer to fetch.
     */
    where?: OnboardingAnswerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OnboardingAnswers to fetch.
     */
    orderBy?: OnboardingAnswerOrderByWithRelationInput | OnboardingAnswerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OnboardingAnswers.
     */
    cursor?: OnboardingAnswerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OnboardingAnswers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OnboardingAnswers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OnboardingAnswers.
     */
    distinct?: OnboardingAnswerScalarFieldEnum | OnboardingAnswerScalarFieldEnum[]
  }

  /**
   * OnboardingAnswer findFirstOrThrow
   */
  export type OnboardingAnswerFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingAnswer
     */
    select?: OnboardingAnswerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingAnswer
     */
    omit?: OnboardingAnswerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingAnswerInclude<ExtArgs> | null
    /**
     * Filter, which OnboardingAnswer to fetch.
     */
    where?: OnboardingAnswerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OnboardingAnswers to fetch.
     */
    orderBy?: OnboardingAnswerOrderByWithRelationInput | OnboardingAnswerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OnboardingAnswers.
     */
    cursor?: OnboardingAnswerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OnboardingAnswers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OnboardingAnswers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OnboardingAnswers.
     */
    distinct?: OnboardingAnswerScalarFieldEnum | OnboardingAnswerScalarFieldEnum[]
  }

  /**
   * OnboardingAnswer findMany
   */
  export type OnboardingAnswerFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingAnswer
     */
    select?: OnboardingAnswerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingAnswer
     */
    omit?: OnboardingAnswerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingAnswerInclude<ExtArgs> | null
    /**
     * Filter, which OnboardingAnswers to fetch.
     */
    where?: OnboardingAnswerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OnboardingAnswers to fetch.
     */
    orderBy?: OnboardingAnswerOrderByWithRelationInput | OnboardingAnswerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OnboardingAnswers.
     */
    cursor?: OnboardingAnswerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OnboardingAnswers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OnboardingAnswers.
     */
    skip?: number
    distinct?: OnboardingAnswerScalarFieldEnum | OnboardingAnswerScalarFieldEnum[]
  }

  /**
   * OnboardingAnswer create
   */
  export type OnboardingAnswerCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingAnswer
     */
    select?: OnboardingAnswerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingAnswer
     */
    omit?: OnboardingAnswerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingAnswerInclude<ExtArgs> | null
    /**
     * The data needed to create a OnboardingAnswer.
     */
    data: XOR<OnboardingAnswerCreateInput, OnboardingAnswerUncheckedCreateInput>
  }

  /**
   * OnboardingAnswer createMany
   */
  export type OnboardingAnswerCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OnboardingAnswers.
     */
    data: OnboardingAnswerCreateManyInput | OnboardingAnswerCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OnboardingAnswer createManyAndReturn
   */
  export type OnboardingAnswerCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingAnswer
     */
    select?: OnboardingAnswerSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingAnswer
     */
    omit?: OnboardingAnswerOmit<ExtArgs> | null
    /**
     * The data used to create many OnboardingAnswers.
     */
    data: OnboardingAnswerCreateManyInput | OnboardingAnswerCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingAnswerIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * OnboardingAnswer update
   */
  export type OnboardingAnswerUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingAnswer
     */
    select?: OnboardingAnswerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingAnswer
     */
    omit?: OnboardingAnswerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingAnswerInclude<ExtArgs> | null
    /**
     * The data needed to update a OnboardingAnswer.
     */
    data: XOR<OnboardingAnswerUpdateInput, OnboardingAnswerUncheckedUpdateInput>
    /**
     * Choose, which OnboardingAnswer to update.
     */
    where: OnboardingAnswerWhereUniqueInput
  }

  /**
   * OnboardingAnswer updateMany
   */
  export type OnboardingAnswerUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OnboardingAnswers.
     */
    data: XOR<OnboardingAnswerUpdateManyMutationInput, OnboardingAnswerUncheckedUpdateManyInput>
    /**
     * Filter which OnboardingAnswers to update
     */
    where?: OnboardingAnswerWhereInput
    /**
     * Limit how many OnboardingAnswers to update.
     */
    limit?: number
  }

  /**
   * OnboardingAnswer updateManyAndReturn
   */
  export type OnboardingAnswerUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingAnswer
     */
    select?: OnboardingAnswerSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingAnswer
     */
    omit?: OnboardingAnswerOmit<ExtArgs> | null
    /**
     * The data used to update OnboardingAnswers.
     */
    data: XOR<OnboardingAnswerUpdateManyMutationInput, OnboardingAnswerUncheckedUpdateManyInput>
    /**
     * Filter which OnboardingAnswers to update
     */
    where?: OnboardingAnswerWhereInput
    /**
     * Limit how many OnboardingAnswers to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingAnswerIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * OnboardingAnswer upsert
   */
  export type OnboardingAnswerUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingAnswer
     */
    select?: OnboardingAnswerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingAnswer
     */
    omit?: OnboardingAnswerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingAnswerInclude<ExtArgs> | null
    /**
     * The filter to search for the OnboardingAnswer to update in case it exists.
     */
    where: OnboardingAnswerWhereUniqueInput
    /**
     * In case the OnboardingAnswer found by the `where` argument doesn't exist, create a new OnboardingAnswer with this data.
     */
    create: XOR<OnboardingAnswerCreateInput, OnboardingAnswerUncheckedCreateInput>
    /**
     * In case the OnboardingAnswer was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OnboardingAnswerUpdateInput, OnboardingAnswerUncheckedUpdateInput>
  }

  /**
   * OnboardingAnswer delete
   */
  export type OnboardingAnswerDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingAnswer
     */
    select?: OnboardingAnswerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingAnswer
     */
    omit?: OnboardingAnswerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingAnswerInclude<ExtArgs> | null
    /**
     * Filter which OnboardingAnswer to delete.
     */
    where: OnboardingAnswerWhereUniqueInput
  }

  /**
   * OnboardingAnswer deleteMany
   */
  export type OnboardingAnswerDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OnboardingAnswers to delete
     */
    where?: OnboardingAnswerWhereInput
    /**
     * Limit how many OnboardingAnswers to delete.
     */
    limit?: number
  }

  /**
   * OnboardingAnswer.option
   */
  export type OnboardingAnswer$optionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingOption
     */
    select?: OnboardingOptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingOption
     */
    omit?: OnboardingOptionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingOptionInclude<ExtArgs> | null
    where?: OnboardingOptionWhereInput
  }

  /**
   * OnboardingAnswer without action
   */
  export type OnboardingAnswerDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OnboardingAnswer
     */
    select?: OnboardingAnswerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OnboardingAnswer
     */
    omit?: OnboardingAnswerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OnboardingAnswerInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const AdminAccountScalarFieldEnum: {
    id: 'id',
    name: 'name',
    email: 'email',
    picture: 'picture',
    profileLink: 'profileLink',
    designation: 'designation',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type AdminAccountScalarFieldEnum = (typeof AdminAccountScalarFieldEnum)[keyof typeof AdminAccountScalarFieldEnum]


  export const BlogPostScalarFieldEnum: {
    id: 'id',
    type: 'type',
    title: 'title',
    slug: 'slug',
    authorId: 'authorId',
    status: 'status',
    content: 'content',
    deletedAt: 'deletedAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type BlogPostScalarFieldEnum = (typeof BlogPostScalarFieldEnum)[keyof typeof BlogPostScalarFieldEnum]


  export const BlogTagScalarFieldEnum: {
    id: 'id',
    tag: 'tag',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type BlogTagScalarFieldEnum = (typeof BlogTagScalarFieldEnum)[keyof typeof BlogTagScalarFieldEnum]


  export const BlogSeoScalarFieldEnum: {
    id: 'id',
    metaTitle: 'metaTitle',
    metaDescription: 'metaDescription',
    metaRobots: 'metaRobots',
    keywords: 'keywords',
    canonicalUrl: 'canonicalUrl',
    ogTitle: 'ogTitle',
    ogDescription: 'ogDescription',
    ogImage: 'ogImage',
    ogUrl: 'ogUrl',
    ogType: 'ogType',
    ogSiteName: 'ogSiteName',
    twitterCardType: 'twitterCardType',
    twitterTitle: 'twitterTitle',
    twitterDescription: 'twitterDescription',
    twitterImage: 'twitterImage',
    twitterSite: 'twitterSite',
    blogpostingHeadline: 'blogpostingHeadline',
    blogpostingDescription: 'blogpostingDescription',
    blogpostingAuthorName: 'blogpostingAuthorName',
    blogpostingAuthorUrl: 'blogpostingAuthorUrl',
    blogpostingPublisherName: 'blogpostingPublisherName',
    blogpostingPublisherLogo: 'blogpostingPublisherLogo',
    blogpostingKeywords: 'blogpostingKeywords',
    blogpostingFeaturedImage: 'blogpostingFeaturedImage',
    mainEntityOfPage: 'mainEntityOfPage',
    favicon: 'favicon',
    language: 'language',
    faqEnabled: 'faqEnabled',
    faqData: 'faqData',
    blogPostId: 'blogPostId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type BlogSeoScalarFieldEnum = (typeof BlogSeoScalarFieldEnum)[keyof typeof BlogSeoScalarFieldEnum]


  export const OnboardingTagVersionScalarFieldEnum: {
    id: 'id',
    tag: 'tag',
    title: 'title',
    description: 'description',
    status: 'status',
    createdAt: 'createdAt',
    publishedAt: 'publishedAt'
  };

  export type OnboardingTagVersionScalarFieldEnum = (typeof OnboardingTagVersionScalarFieldEnum)[keyof typeof OnboardingTagVersionScalarFieldEnum]


  export const OnboardingQuestionScalarFieldEnum: {
    id: 'id',
    versionId: 'versionId',
    slug: 'slug',
    type: 'type',
    title: 'title',
    iconSlug: 'iconSlug',
    isActive: 'isActive',
    sortOrder: 'sortOrder',
    allowOtherOption: 'allowOtherOption',
    createdAt: 'createdAt'
  };

  export type OnboardingQuestionScalarFieldEnum = (typeof OnboardingQuestionScalarFieldEnum)[keyof typeof OnboardingQuestionScalarFieldEnum]


  export const OnboardingOptionScalarFieldEnum: {
    id: 'id',
    questionId: 'questionId',
    value: 'value',
    label: 'label',
    iconSlug: 'iconSlug',
    sortOrder: 'sortOrder'
  };

  export type OnboardingOptionScalarFieldEnum = (typeof OnboardingOptionScalarFieldEnum)[keyof typeof OnboardingOptionScalarFieldEnum]


  export const OnboardingResponseScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    email: 'email',
    clientFingerprint: 'clientFingerprint',
    intentTag: 'intentTag',
    orgSizeBracket: 'orgSizeBracket',
    tagVersionId: 'tagVersionId',
    createdAt: 'createdAt'
  };

  export type OnboardingResponseScalarFieldEnum = (typeof OnboardingResponseScalarFieldEnum)[keyof typeof OnboardingResponseScalarFieldEnum]


  export const OnboardingAnswerScalarFieldEnum: {
    id: 'id',
    responseId: 'responseId',
    questionId: 'questionId',
    optionId: 'optionId',
    customValue: 'customValue'
  };

  export type OnboardingAnswerScalarFieldEnum = (typeof OnboardingAnswerScalarFieldEnum)[keyof typeof OnboardingAnswerScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'BlogPostType'
   */
  export type EnumBlogPostTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BlogPostType'>
    


  /**
   * Reference to a field of type 'BlogPostType[]'
   */
  export type ListEnumBlogPostTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BlogPostType[]'>
    


  /**
   * Reference to a field of type 'BlogPostStatus'
   */
  export type EnumBlogPostStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BlogPostStatus'>
    


  /**
   * Reference to a field of type 'BlogPostStatus[]'
   */
  export type ListEnumBlogPostStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BlogPostStatus[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'TagStatus'
   */
  export type EnumTagStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TagStatus'>
    


  /**
   * Reference to a field of type 'TagStatus[]'
   */
  export type ListEnumTagStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TagStatus[]'>
    


  /**
   * Reference to a field of type 'QuestionType'
   */
  export type EnumQuestionTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QuestionType'>
    


  /**
   * Reference to a field of type 'QuestionType[]'
   */
  export type ListEnumQuestionTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QuestionType[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'IntentTag'
   */
  export type EnumIntentTagFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'IntentTag'>
    


  /**
   * Reference to a field of type 'IntentTag[]'
   */
  export type ListEnumIntentTagFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'IntentTag[]'>
    


  /**
   * Reference to a field of type 'OrgSizeBracket'
   */
  export type EnumOrgSizeBracketFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OrgSizeBracket'>
    


  /**
   * Reference to a field of type 'OrgSizeBracket[]'
   */
  export type ListEnumOrgSizeBracketFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OrgSizeBracket[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type AdminAccountWhereInput = {
    AND?: AdminAccountWhereInput | AdminAccountWhereInput[]
    OR?: AdminAccountWhereInput[]
    NOT?: AdminAccountWhereInput | AdminAccountWhereInput[]
    id?: StringFilter<"AdminAccount"> | string
    name?: StringFilter<"AdminAccount"> | string
    email?: StringFilter<"AdminAccount"> | string
    picture?: StringNullableFilter<"AdminAccount"> | string | null
    profileLink?: StringNullableFilter<"AdminAccount"> | string | null
    designation?: StringNullableFilter<"AdminAccount"> | string | null
    createdAt?: DateTimeFilter<"AdminAccount"> | Date | string
    updatedAt?: DateTimeFilter<"AdminAccount"> | Date | string
    BlogPost?: BlogPostListRelationFilter
  }

  export type AdminAccountOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    picture?: SortOrderInput | SortOrder
    profileLink?: SortOrderInput | SortOrder
    designation?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    BlogPost?: BlogPostOrderByRelationAggregateInput
  }

  export type AdminAccountWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: AdminAccountWhereInput | AdminAccountWhereInput[]
    OR?: AdminAccountWhereInput[]
    NOT?: AdminAccountWhereInput | AdminAccountWhereInput[]
    name?: StringFilter<"AdminAccount"> | string
    picture?: StringNullableFilter<"AdminAccount"> | string | null
    profileLink?: StringNullableFilter<"AdminAccount"> | string | null
    designation?: StringNullableFilter<"AdminAccount"> | string | null
    createdAt?: DateTimeFilter<"AdminAccount"> | Date | string
    updatedAt?: DateTimeFilter<"AdminAccount"> | Date | string
    BlogPost?: BlogPostListRelationFilter
  }, "id" | "email">

  export type AdminAccountOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    picture?: SortOrderInput | SortOrder
    profileLink?: SortOrderInput | SortOrder
    designation?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: AdminAccountCountOrderByAggregateInput
    _max?: AdminAccountMaxOrderByAggregateInput
    _min?: AdminAccountMinOrderByAggregateInput
  }

  export type AdminAccountScalarWhereWithAggregatesInput = {
    AND?: AdminAccountScalarWhereWithAggregatesInput | AdminAccountScalarWhereWithAggregatesInput[]
    OR?: AdminAccountScalarWhereWithAggregatesInput[]
    NOT?: AdminAccountScalarWhereWithAggregatesInput | AdminAccountScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AdminAccount"> | string
    name?: StringWithAggregatesFilter<"AdminAccount"> | string
    email?: StringWithAggregatesFilter<"AdminAccount"> | string
    picture?: StringNullableWithAggregatesFilter<"AdminAccount"> | string | null
    profileLink?: StringNullableWithAggregatesFilter<"AdminAccount"> | string | null
    designation?: StringNullableWithAggregatesFilter<"AdminAccount"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"AdminAccount"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"AdminAccount"> | Date | string
  }

  export type BlogPostWhereInput = {
    AND?: BlogPostWhereInput | BlogPostWhereInput[]
    OR?: BlogPostWhereInput[]
    NOT?: BlogPostWhereInput | BlogPostWhereInput[]
    id?: StringFilter<"BlogPost"> | string
    type?: EnumBlogPostTypeFilter<"BlogPost"> | $Enums.BlogPostType
    title?: StringFilter<"BlogPost"> | string
    slug?: StringFilter<"BlogPost"> | string
    authorId?: StringFilter<"BlogPost"> | string
    status?: EnumBlogPostStatusFilter<"BlogPost"> | $Enums.BlogPostStatus
    content?: JsonFilter<"BlogPost">
    deletedAt?: DateTimeNullableFilter<"BlogPost"> | Date | string | null
    createdAt?: DateTimeFilter<"BlogPost"> | Date | string
    updatedAt?: DateTimeFilter<"BlogPost"> | Date | string
    tags?: BlogTagListRelationFilter
    author?: XOR<AdminAccountScalarRelationFilter, AdminAccountWhereInput>
    seo?: XOR<BlogSeoNullableScalarRelationFilter, BlogSeoWhereInput> | null
  }

  export type BlogPostOrderByWithRelationInput = {
    id?: SortOrder
    type?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    authorId?: SortOrder
    status?: SortOrder
    content?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    tags?: BlogTagOrderByRelationAggregateInput
    author?: AdminAccountOrderByWithRelationInput
    seo?: BlogSeoOrderByWithRelationInput
  }

  export type BlogPostWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    slug?: string
    AND?: BlogPostWhereInput | BlogPostWhereInput[]
    OR?: BlogPostWhereInput[]
    NOT?: BlogPostWhereInput | BlogPostWhereInput[]
    type?: EnumBlogPostTypeFilter<"BlogPost"> | $Enums.BlogPostType
    title?: StringFilter<"BlogPost"> | string
    authorId?: StringFilter<"BlogPost"> | string
    status?: EnumBlogPostStatusFilter<"BlogPost"> | $Enums.BlogPostStatus
    content?: JsonFilter<"BlogPost">
    deletedAt?: DateTimeNullableFilter<"BlogPost"> | Date | string | null
    createdAt?: DateTimeFilter<"BlogPost"> | Date | string
    updatedAt?: DateTimeFilter<"BlogPost"> | Date | string
    tags?: BlogTagListRelationFilter
    author?: XOR<AdminAccountScalarRelationFilter, AdminAccountWhereInput>
    seo?: XOR<BlogSeoNullableScalarRelationFilter, BlogSeoWhereInput> | null
  }, "id" | "slug">

  export type BlogPostOrderByWithAggregationInput = {
    id?: SortOrder
    type?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    authorId?: SortOrder
    status?: SortOrder
    content?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: BlogPostCountOrderByAggregateInput
    _max?: BlogPostMaxOrderByAggregateInput
    _min?: BlogPostMinOrderByAggregateInput
  }

  export type BlogPostScalarWhereWithAggregatesInput = {
    AND?: BlogPostScalarWhereWithAggregatesInput | BlogPostScalarWhereWithAggregatesInput[]
    OR?: BlogPostScalarWhereWithAggregatesInput[]
    NOT?: BlogPostScalarWhereWithAggregatesInput | BlogPostScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"BlogPost"> | string
    type?: EnumBlogPostTypeWithAggregatesFilter<"BlogPost"> | $Enums.BlogPostType
    title?: StringWithAggregatesFilter<"BlogPost"> | string
    slug?: StringWithAggregatesFilter<"BlogPost"> | string
    authorId?: StringWithAggregatesFilter<"BlogPost"> | string
    status?: EnumBlogPostStatusWithAggregatesFilter<"BlogPost"> | $Enums.BlogPostStatus
    content?: JsonWithAggregatesFilter<"BlogPost">
    deletedAt?: DateTimeNullableWithAggregatesFilter<"BlogPost"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"BlogPost"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"BlogPost"> | Date | string
  }

  export type BlogTagWhereInput = {
    AND?: BlogTagWhereInput | BlogTagWhereInput[]
    OR?: BlogTagWhereInput[]
    NOT?: BlogTagWhereInput | BlogTagWhereInput[]
    id?: StringFilter<"BlogTag"> | string
    tag?: StringFilter<"BlogTag"> | string
    createdAt?: DateTimeFilter<"BlogTag"> | Date | string
    updatedAt?: DateTimeFilter<"BlogTag"> | Date | string
    posts?: BlogPostListRelationFilter
  }

  export type BlogTagOrderByWithRelationInput = {
    id?: SortOrder
    tag?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    posts?: BlogPostOrderByRelationAggregateInput
  }

  export type BlogTagWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tag?: string
    AND?: BlogTagWhereInput | BlogTagWhereInput[]
    OR?: BlogTagWhereInput[]
    NOT?: BlogTagWhereInput | BlogTagWhereInput[]
    createdAt?: DateTimeFilter<"BlogTag"> | Date | string
    updatedAt?: DateTimeFilter<"BlogTag"> | Date | string
    posts?: BlogPostListRelationFilter
  }, "id" | "tag">

  export type BlogTagOrderByWithAggregationInput = {
    id?: SortOrder
    tag?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: BlogTagCountOrderByAggregateInput
    _max?: BlogTagMaxOrderByAggregateInput
    _min?: BlogTagMinOrderByAggregateInput
  }

  export type BlogTagScalarWhereWithAggregatesInput = {
    AND?: BlogTagScalarWhereWithAggregatesInput | BlogTagScalarWhereWithAggregatesInput[]
    OR?: BlogTagScalarWhereWithAggregatesInput[]
    NOT?: BlogTagScalarWhereWithAggregatesInput | BlogTagScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"BlogTag"> | string
    tag?: StringWithAggregatesFilter<"BlogTag"> | string
    createdAt?: DateTimeWithAggregatesFilter<"BlogTag"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"BlogTag"> | Date | string
  }

  export type BlogSeoWhereInput = {
    AND?: BlogSeoWhereInput | BlogSeoWhereInput[]
    OR?: BlogSeoWhereInput[]
    NOT?: BlogSeoWhereInput | BlogSeoWhereInput[]
    id?: StringFilter<"BlogSeo"> | string
    metaTitle?: StringNullableFilter<"BlogSeo"> | string | null
    metaDescription?: StringNullableFilter<"BlogSeo"> | string | null
    metaRobots?: StringNullableFilter<"BlogSeo"> | string | null
    keywords?: StringNullableFilter<"BlogSeo"> | string | null
    canonicalUrl?: StringNullableFilter<"BlogSeo"> | string | null
    ogTitle?: StringNullableFilter<"BlogSeo"> | string | null
    ogDescription?: StringNullableFilter<"BlogSeo"> | string | null
    ogImage?: StringNullableFilter<"BlogSeo"> | string | null
    ogUrl?: StringNullableFilter<"BlogSeo"> | string | null
    ogType?: StringNullableFilter<"BlogSeo"> | string | null
    ogSiteName?: StringNullableFilter<"BlogSeo"> | string | null
    twitterCardType?: StringNullableFilter<"BlogSeo"> | string | null
    twitterTitle?: StringNullableFilter<"BlogSeo"> | string | null
    twitterDescription?: StringNullableFilter<"BlogSeo"> | string | null
    twitterImage?: StringNullableFilter<"BlogSeo"> | string | null
    twitterSite?: StringNullableFilter<"BlogSeo"> | string | null
    blogpostingHeadline?: StringNullableFilter<"BlogSeo"> | string | null
    blogpostingDescription?: StringNullableFilter<"BlogSeo"> | string | null
    blogpostingAuthorName?: StringNullableFilter<"BlogSeo"> | string | null
    blogpostingAuthorUrl?: StringNullableFilter<"BlogSeo"> | string | null
    blogpostingPublisherName?: StringNullableFilter<"BlogSeo"> | string | null
    blogpostingPublisherLogo?: StringNullableFilter<"BlogSeo"> | string | null
    blogpostingKeywords?: StringNullableFilter<"BlogSeo"> | string | null
    blogpostingFeaturedImage?: StringNullableFilter<"BlogSeo"> | string | null
    mainEntityOfPage?: StringNullableFilter<"BlogSeo"> | string | null
    favicon?: StringNullableFilter<"BlogSeo"> | string | null
    language?: StringNullableFilter<"BlogSeo"> | string | null
    faqEnabled?: BoolFilter<"BlogSeo"> | boolean
    faqData?: JsonNullableFilter<"BlogSeo">
    blogPostId?: StringFilter<"BlogSeo"> | string
    createdAt?: DateTimeFilter<"BlogSeo"> | Date | string
    updatedAt?: DateTimeFilter<"BlogSeo"> | Date | string
    blogPost?: XOR<BlogPostScalarRelationFilter, BlogPostWhereInput>
  }

  export type BlogSeoOrderByWithRelationInput = {
    id?: SortOrder
    metaTitle?: SortOrderInput | SortOrder
    metaDescription?: SortOrderInput | SortOrder
    metaRobots?: SortOrderInput | SortOrder
    keywords?: SortOrderInput | SortOrder
    canonicalUrl?: SortOrderInput | SortOrder
    ogTitle?: SortOrderInput | SortOrder
    ogDescription?: SortOrderInput | SortOrder
    ogImage?: SortOrderInput | SortOrder
    ogUrl?: SortOrderInput | SortOrder
    ogType?: SortOrderInput | SortOrder
    ogSiteName?: SortOrderInput | SortOrder
    twitterCardType?: SortOrderInput | SortOrder
    twitterTitle?: SortOrderInput | SortOrder
    twitterDescription?: SortOrderInput | SortOrder
    twitterImage?: SortOrderInput | SortOrder
    twitterSite?: SortOrderInput | SortOrder
    blogpostingHeadline?: SortOrderInput | SortOrder
    blogpostingDescription?: SortOrderInput | SortOrder
    blogpostingAuthorName?: SortOrderInput | SortOrder
    blogpostingAuthorUrl?: SortOrderInput | SortOrder
    blogpostingPublisherName?: SortOrderInput | SortOrder
    blogpostingPublisherLogo?: SortOrderInput | SortOrder
    blogpostingKeywords?: SortOrderInput | SortOrder
    blogpostingFeaturedImage?: SortOrderInput | SortOrder
    mainEntityOfPage?: SortOrderInput | SortOrder
    favicon?: SortOrderInput | SortOrder
    language?: SortOrderInput | SortOrder
    faqEnabled?: SortOrder
    faqData?: SortOrderInput | SortOrder
    blogPostId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    blogPost?: BlogPostOrderByWithRelationInput
  }

  export type BlogSeoWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    blogPostId?: string
    AND?: BlogSeoWhereInput | BlogSeoWhereInput[]
    OR?: BlogSeoWhereInput[]
    NOT?: BlogSeoWhereInput | BlogSeoWhereInput[]
    metaTitle?: StringNullableFilter<"BlogSeo"> | string | null
    metaDescription?: StringNullableFilter<"BlogSeo"> | string | null
    metaRobots?: StringNullableFilter<"BlogSeo"> | string | null
    keywords?: StringNullableFilter<"BlogSeo"> | string | null
    canonicalUrl?: StringNullableFilter<"BlogSeo"> | string | null
    ogTitle?: StringNullableFilter<"BlogSeo"> | string | null
    ogDescription?: StringNullableFilter<"BlogSeo"> | string | null
    ogImage?: StringNullableFilter<"BlogSeo"> | string | null
    ogUrl?: StringNullableFilter<"BlogSeo"> | string | null
    ogType?: StringNullableFilter<"BlogSeo"> | string | null
    ogSiteName?: StringNullableFilter<"BlogSeo"> | string | null
    twitterCardType?: StringNullableFilter<"BlogSeo"> | string | null
    twitterTitle?: StringNullableFilter<"BlogSeo"> | string | null
    twitterDescription?: StringNullableFilter<"BlogSeo"> | string | null
    twitterImage?: StringNullableFilter<"BlogSeo"> | string | null
    twitterSite?: StringNullableFilter<"BlogSeo"> | string | null
    blogpostingHeadline?: StringNullableFilter<"BlogSeo"> | string | null
    blogpostingDescription?: StringNullableFilter<"BlogSeo"> | string | null
    blogpostingAuthorName?: StringNullableFilter<"BlogSeo"> | string | null
    blogpostingAuthorUrl?: StringNullableFilter<"BlogSeo"> | string | null
    blogpostingPublisherName?: StringNullableFilter<"BlogSeo"> | string | null
    blogpostingPublisherLogo?: StringNullableFilter<"BlogSeo"> | string | null
    blogpostingKeywords?: StringNullableFilter<"BlogSeo"> | string | null
    blogpostingFeaturedImage?: StringNullableFilter<"BlogSeo"> | string | null
    mainEntityOfPage?: StringNullableFilter<"BlogSeo"> | string | null
    favicon?: StringNullableFilter<"BlogSeo"> | string | null
    language?: StringNullableFilter<"BlogSeo"> | string | null
    faqEnabled?: BoolFilter<"BlogSeo"> | boolean
    faqData?: JsonNullableFilter<"BlogSeo">
    createdAt?: DateTimeFilter<"BlogSeo"> | Date | string
    updatedAt?: DateTimeFilter<"BlogSeo"> | Date | string
    blogPost?: XOR<BlogPostScalarRelationFilter, BlogPostWhereInput>
  }, "id" | "blogPostId">

  export type BlogSeoOrderByWithAggregationInput = {
    id?: SortOrder
    metaTitle?: SortOrderInput | SortOrder
    metaDescription?: SortOrderInput | SortOrder
    metaRobots?: SortOrderInput | SortOrder
    keywords?: SortOrderInput | SortOrder
    canonicalUrl?: SortOrderInput | SortOrder
    ogTitle?: SortOrderInput | SortOrder
    ogDescription?: SortOrderInput | SortOrder
    ogImage?: SortOrderInput | SortOrder
    ogUrl?: SortOrderInput | SortOrder
    ogType?: SortOrderInput | SortOrder
    ogSiteName?: SortOrderInput | SortOrder
    twitterCardType?: SortOrderInput | SortOrder
    twitterTitle?: SortOrderInput | SortOrder
    twitterDescription?: SortOrderInput | SortOrder
    twitterImage?: SortOrderInput | SortOrder
    twitterSite?: SortOrderInput | SortOrder
    blogpostingHeadline?: SortOrderInput | SortOrder
    blogpostingDescription?: SortOrderInput | SortOrder
    blogpostingAuthorName?: SortOrderInput | SortOrder
    blogpostingAuthorUrl?: SortOrderInput | SortOrder
    blogpostingPublisherName?: SortOrderInput | SortOrder
    blogpostingPublisherLogo?: SortOrderInput | SortOrder
    blogpostingKeywords?: SortOrderInput | SortOrder
    blogpostingFeaturedImage?: SortOrderInput | SortOrder
    mainEntityOfPage?: SortOrderInput | SortOrder
    favicon?: SortOrderInput | SortOrder
    language?: SortOrderInput | SortOrder
    faqEnabled?: SortOrder
    faqData?: SortOrderInput | SortOrder
    blogPostId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: BlogSeoCountOrderByAggregateInput
    _max?: BlogSeoMaxOrderByAggregateInput
    _min?: BlogSeoMinOrderByAggregateInput
  }

  export type BlogSeoScalarWhereWithAggregatesInput = {
    AND?: BlogSeoScalarWhereWithAggregatesInput | BlogSeoScalarWhereWithAggregatesInput[]
    OR?: BlogSeoScalarWhereWithAggregatesInput[]
    NOT?: BlogSeoScalarWhereWithAggregatesInput | BlogSeoScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"BlogSeo"> | string
    metaTitle?: StringNullableWithAggregatesFilter<"BlogSeo"> | string | null
    metaDescription?: StringNullableWithAggregatesFilter<"BlogSeo"> | string | null
    metaRobots?: StringNullableWithAggregatesFilter<"BlogSeo"> | string | null
    keywords?: StringNullableWithAggregatesFilter<"BlogSeo"> | string | null
    canonicalUrl?: StringNullableWithAggregatesFilter<"BlogSeo"> | string | null
    ogTitle?: StringNullableWithAggregatesFilter<"BlogSeo"> | string | null
    ogDescription?: StringNullableWithAggregatesFilter<"BlogSeo"> | string | null
    ogImage?: StringNullableWithAggregatesFilter<"BlogSeo"> | string | null
    ogUrl?: StringNullableWithAggregatesFilter<"BlogSeo"> | string | null
    ogType?: StringNullableWithAggregatesFilter<"BlogSeo"> | string | null
    ogSiteName?: StringNullableWithAggregatesFilter<"BlogSeo"> | string | null
    twitterCardType?: StringNullableWithAggregatesFilter<"BlogSeo"> | string | null
    twitterTitle?: StringNullableWithAggregatesFilter<"BlogSeo"> | string | null
    twitterDescription?: StringNullableWithAggregatesFilter<"BlogSeo"> | string | null
    twitterImage?: StringNullableWithAggregatesFilter<"BlogSeo"> | string | null
    twitterSite?: StringNullableWithAggregatesFilter<"BlogSeo"> | string | null
    blogpostingHeadline?: StringNullableWithAggregatesFilter<"BlogSeo"> | string | null
    blogpostingDescription?: StringNullableWithAggregatesFilter<"BlogSeo"> | string | null
    blogpostingAuthorName?: StringNullableWithAggregatesFilter<"BlogSeo"> | string | null
    blogpostingAuthorUrl?: StringNullableWithAggregatesFilter<"BlogSeo"> | string | null
    blogpostingPublisherName?: StringNullableWithAggregatesFilter<"BlogSeo"> | string | null
    blogpostingPublisherLogo?: StringNullableWithAggregatesFilter<"BlogSeo"> | string | null
    blogpostingKeywords?: StringNullableWithAggregatesFilter<"BlogSeo"> | string | null
    blogpostingFeaturedImage?: StringNullableWithAggregatesFilter<"BlogSeo"> | string | null
    mainEntityOfPage?: StringNullableWithAggregatesFilter<"BlogSeo"> | string | null
    favicon?: StringNullableWithAggregatesFilter<"BlogSeo"> | string | null
    language?: StringNullableWithAggregatesFilter<"BlogSeo"> | string | null
    faqEnabled?: BoolWithAggregatesFilter<"BlogSeo"> | boolean
    faqData?: JsonNullableWithAggregatesFilter<"BlogSeo">
    blogPostId?: StringWithAggregatesFilter<"BlogSeo"> | string
    createdAt?: DateTimeWithAggregatesFilter<"BlogSeo"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"BlogSeo"> | Date | string
  }

  export type OnboardingTagVersionWhereInput = {
    AND?: OnboardingTagVersionWhereInput | OnboardingTagVersionWhereInput[]
    OR?: OnboardingTagVersionWhereInput[]
    NOT?: OnboardingTagVersionWhereInput | OnboardingTagVersionWhereInput[]
    id?: StringFilter<"OnboardingTagVersion"> | string
    tag?: StringFilter<"OnboardingTagVersion"> | string
    title?: StringFilter<"OnboardingTagVersion"> | string
    description?: StringNullableFilter<"OnboardingTagVersion"> | string | null
    status?: EnumTagStatusFilter<"OnboardingTagVersion"> | $Enums.TagStatus
    createdAt?: DateTimeFilter<"OnboardingTagVersion"> | Date | string
    publishedAt?: DateTimeNullableFilter<"OnboardingTagVersion"> | Date | string | null
    questions?: OnboardingQuestionListRelationFilter
    responses?: OnboardingResponseListRelationFilter
  }

  export type OnboardingTagVersionOrderByWithRelationInput = {
    id?: SortOrder
    tag?: SortOrder
    title?: SortOrder
    description?: SortOrderInput | SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    publishedAt?: SortOrderInput | SortOrder
    questions?: OnboardingQuestionOrderByRelationAggregateInput
    responses?: OnboardingResponseOrderByRelationAggregateInput
  }

  export type OnboardingTagVersionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tag?: string
    AND?: OnboardingTagVersionWhereInput | OnboardingTagVersionWhereInput[]
    OR?: OnboardingTagVersionWhereInput[]
    NOT?: OnboardingTagVersionWhereInput | OnboardingTagVersionWhereInput[]
    title?: StringFilter<"OnboardingTagVersion"> | string
    description?: StringNullableFilter<"OnboardingTagVersion"> | string | null
    status?: EnumTagStatusFilter<"OnboardingTagVersion"> | $Enums.TagStatus
    createdAt?: DateTimeFilter<"OnboardingTagVersion"> | Date | string
    publishedAt?: DateTimeNullableFilter<"OnboardingTagVersion"> | Date | string | null
    questions?: OnboardingQuestionListRelationFilter
    responses?: OnboardingResponseListRelationFilter
  }, "id" | "tag">

  export type OnboardingTagVersionOrderByWithAggregationInput = {
    id?: SortOrder
    tag?: SortOrder
    title?: SortOrder
    description?: SortOrderInput | SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    publishedAt?: SortOrderInput | SortOrder
    _count?: OnboardingTagVersionCountOrderByAggregateInput
    _max?: OnboardingTagVersionMaxOrderByAggregateInput
    _min?: OnboardingTagVersionMinOrderByAggregateInput
  }

  export type OnboardingTagVersionScalarWhereWithAggregatesInput = {
    AND?: OnboardingTagVersionScalarWhereWithAggregatesInput | OnboardingTagVersionScalarWhereWithAggregatesInput[]
    OR?: OnboardingTagVersionScalarWhereWithAggregatesInput[]
    NOT?: OnboardingTagVersionScalarWhereWithAggregatesInput | OnboardingTagVersionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"OnboardingTagVersion"> | string
    tag?: StringWithAggregatesFilter<"OnboardingTagVersion"> | string
    title?: StringWithAggregatesFilter<"OnboardingTagVersion"> | string
    description?: StringNullableWithAggregatesFilter<"OnboardingTagVersion"> | string | null
    status?: EnumTagStatusWithAggregatesFilter<"OnboardingTagVersion"> | $Enums.TagStatus
    createdAt?: DateTimeWithAggregatesFilter<"OnboardingTagVersion"> | Date | string
    publishedAt?: DateTimeNullableWithAggregatesFilter<"OnboardingTagVersion"> | Date | string | null
  }

  export type OnboardingQuestionWhereInput = {
    AND?: OnboardingQuestionWhereInput | OnboardingQuestionWhereInput[]
    OR?: OnboardingQuestionWhereInput[]
    NOT?: OnboardingQuestionWhereInput | OnboardingQuestionWhereInput[]
    id?: StringFilter<"OnboardingQuestion"> | string
    versionId?: StringFilter<"OnboardingQuestion"> | string
    slug?: StringFilter<"OnboardingQuestion"> | string
    type?: EnumQuestionTypeFilter<"OnboardingQuestion"> | $Enums.QuestionType
    title?: StringFilter<"OnboardingQuestion"> | string
    iconSlug?: StringNullableFilter<"OnboardingQuestion"> | string | null
    isActive?: BoolFilter<"OnboardingQuestion"> | boolean
    sortOrder?: IntFilter<"OnboardingQuestion"> | number
    allowOtherOption?: BoolFilter<"OnboardingQuestion"> | boolean
    createdAt?: DateTimeFilter<"OnboardingQuestion"> | Date | string
    version?: XOR<OnboardingTagVersionScalarRelationFilter, OnboardingTagVersionWhereInput>
    options?: OnboardingOptionListRelationFilter
    answers?: OnboardingAnswerListRelationFilter
  }

  export type OnboardingQuestionOrderByWithRelationInput = {
    id?: SortOrder
    versionId?: SortOrder
    slug?: SortOrder
    type?: SortOrder
    title?: SortOrder
    iconSlug?: SortOrderInput | SortOrder
    isActive?: SortOrder
    sortOrder?: SortOrder
    allowOtherOption?: SortOrder
    createdAt?: SortOrder
    version?: OnboardingTagVersionOrderByWithRelationInput
    options?: OnboardingOptionOrderByRelationAggregateInput
    answers?: OnboardingAnswerOrderByRelationAggregateInput
  }

  export type OnboardingQuestionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: OnboardingQuestionWhereInput | OnboardingQuestionWhereInput[]
    OR?: OnboardingQuestionWhereInput[]
    NOT?: OnboardingQuestionWhereInput | OnboardingQuestionWhereInput[]
    versionId?: StringFilter<"OnboardingQuestion"> | string
    slug?: StringFilter<"OnboardingQuestion"> | string
    type?: EnumQuestionTypeFilter<"OnboardingQuestion"> | $Enums.QuestionType
    title?: StringFilter<"OnboardingQuestion"> | string
    iconSlug?: StringNullableFilter<"OnboardingQuestion"> | string | null
    isActive?: BoolFilter<"OnboardingQuestion"> | boolean
    sortOrder?: IntFilter<"OnboardingQuestion"> | number
    allowOtherOption?: BoolFilter<"OnboardingQuestion"> | boolean
    createdAt?: DateTimeFilter<"OnboardingQuestion"> | Date | string
    version?: XOR<OnboardingTagVersionScalarRelationFilter, OnboardingTagVersionWhereInput>
    options?: OnboardingOptionListRelationFilter
    answers?: OnboardingAnswerListRelationFilter
  }, "id">

  export type OnboardingQuestionOrderByWithAggregationInput = {
    id?: SortOrder
    versionId?: SortOrder
    slug?: SortOrder
    type?: SortOrder
    title?: SortOrder
    iconSlug?: SortOrderInput | SortOrder
    isActive?: SortOrder
    sortOrder?: SortOrder
    allowOtherOption?: SortOrder
    createdAt?: SortOrder
    _count?: OnboardingQuestionCountOrderByAggregateInput
    _avg?: OnboardingQuestionAvgOrderByAggregateInput
    _max?: OnboardingQuestionMaxOrderByAggregateInput
    _min?: OnboardingQuestionMinOrderByAggregateInput
    _sum?: OnboardingQuestionSumOrderByAggregateInput
  }

  export type OnboardingQuestionScalarWhereWithAggregatesInput = {
    AND?: OnboardingQuestionScalarWhereWithAggregatesInput | OnboardingQuestionScalarWhereWithAggregatesInput[]
    OR?: OnboardingQuestionScalarWhereWithAggregatesInput[]
    NOT?: OnboardingQuestionScalarWhereWithAggregatesInput | OnboardingQuestionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"OnboardingQuestion"> | string
    versionId?: StringWithAggregatesFilter<"OnboardingQuestion"> | string
    slug?: StringWithAggregatesFilter<"OnboardingQuestion"> | string
    type?: EnumQuestionTypeWithAggregatesFilter<"OnboardingQuestion"> | $Enums.QuestionType
    title?: StringWithAggregatesFilter<"OnboardingQuestion"> | string
    iconSlug?: StringNullableWithAggregatesFilter<"OnboardingQuestion"> | string | null
    isActive?: BoolWithAggregatesFilter<"OnboardingQuestion"> | boolean
    sortOrder?: IntWithAggregatesFilter<"OnboardingQuestion"> | number
    allowOtherOption?: BoolWithAggregatesFilter<"OnboardingQuestion"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"OnboardingQuestion"> | Date | string
  }

  export type OnboardingOptionWhereInput = {
    AND?: OnboardingOptionWhereInput | OnboardingOptionWhereInput[]
    OR?: OnboardingOptionWhereInput[]
    NOT?: OnboardingOptionWhereInput | OnboardingOptionWhereInput[]
    id?: StringFilter<"OnboardingOption"> | string
    questionId?: StringFilter<"OnboardingOption"> | string
    value?: StringFilter<"OnboardingOption"> | string
    label?: StringFilter<"OnboardingOption"> | string
    iconSlug?: StringNullableFilter<"OnboardingOption"> | string | null
    sortOrder?: IntNullableFilter<"OnboardingOption"> | number | null
    question?: XOR<OnboardingQuestionScalarRelationFilter, OnboardingQuestionWhereInput>
    answers?: OnboardingAnswerListRelationFilter
  }

  export type OnboardingOptionOrderByWithRelationInput = {
    id?: SortOrder
    questionId?: SortOrder
    value?: SortOrder
    label?: SortOrder
    iconSlug?: SortOrderInput | SortOrder
    sortOrder?: SortOrderInput | SortOrder
    question?: OnboardingQuestionOrderByWithRelationInput
    answers?: OnboardingAnswerOrderByRelationAggregateInput
  }

  export type OnboardingOptionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: OnboardingOptionWhereInput | OnboardingOptionWhereInput[]
    OR?: OnboardingOptionWhereInput[]
    NOT?: OnboardingOptionWhereInput | OnboardingOptionWhereInput[]
    questionId?: StringFilter<"OnboardingOption"> | string
    value?: StringFilter<"OnboardingOption"> | string
    label?: StringFilter<"OnboardingOption"> | string
    iconSlug?: StringNullableFilter<"OnboardingOption"> | string | null
    sortOrder?: IntNullableFilter<"OnboardingOption"> | number | null
    question?: XOR<OnboardingQuestionScalarRelationFilter, OnboardingQuestionWhereInput>
    answers?: OnboardingAnswerListRelationFilter
  }, "id">

  export type OnboardingOptionOrderByWithAggregationInput = {
    id?: SortOrder
    questionId?: SortOrder
    value?: SortOrder
    label?: SortOrder
    iconSlug?: SortOrderInput | SortOrder
    sortOrder?: SortOrderInput | SortOrder
    _count?: OnboardingOptionCountOrderByAggregateInput
    _avg?: OnboardingOptionAvgOrderByAggregateInput
    _max?: OnboardingOptionMaxOrderByAggregateInput
    _min?: OnboardingOptionMinOrderByAggregateInput
    _sum?: OnboardingOptionSumOrderByAggregateInput
  }

  export type OnboardingOptionScalarWhereWithAggregatesInput = {
    AND?: OnboardingOptionScalarWhereWithAggregatesInput | OnboardingOptionScalarWhereWithAggregatesInput[]
    OR?: OnboardingOptionScalarWhereWithAggregatesInput[]
    NOT?: OnboardingOptionScalarWhereWithAggregatesInput | OnboardingOptionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"OnboardingOption"> | string
    questionId?: StringWithAggregatesFilter<"OnboardingOption"> | string
    value?: StringWithAggregatesFilter<"OnboardingOption"> | string
    label?: StringWithAggregatesFilter<"OnboardingOption"> | string
    iconSlug?: StringNullableWithAggregatesFilter<"OnboardingOption"> | string | null
    sortOrder?: IntNullableWithAggregatesFilter<"OnboardingOption"> | number | null
  }

  export type OnboardingResponseWhereInput = {
    AND?: OnboardingResponseWhereInput | OnboardingResponseWhereInput[]
    OR?: OnboardingResponseWhereInput[]
    NOT?: OnboardingResponseWhereInput | OnboardingResponseWhereInput[]
    id?: StringFilter<"OnboardingResponse"> | string
    userId?: StringFilter<"OnboardingResponse"> | string
    email?: StringFilter<"OnboardingResponse"> | string
    clientFingerprint?: StringFilter<"OnboardingResponse"> | string
    intentTag?: EnumIntentTagFilter<"OnboardingResponse"> | $Enums.IntentTag
    orgSizeBracket?: EnumOrgSizeBracketFilter<"OnboardingResponse"> | $Enums.OrgSizeBracket
    tagVersionId?: StringFilter<"OnboardingResponse"> | string
    createdAt?: DateTimeFilter<"OnboardingResponse"> | Date | string
    tagVersion?: XOR<OnboardingTagVersionScalarRelationFilter, OnboardingTagVersionWhereInput>
    answers?: OnboardingAnswerListRelationFilter
  }

  export type OnboardingResponseOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    email?: SortOrder
    clientFingerprint?: SortOrder
    intentTag?: SortOrder
    orgSizeBracket?: SortOrder
    tagVersionId?: SortOrder
    createdAt?: SortOrder
    tagVersion?: OnboardingTagVersionOrderByWithRelationInput
    answers?: OnboardingAnswerOrderByRelationAggregateInput
  }

  export type OnboardingResponseWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: OnboardingResponseWhereInput | OnboardingResponseWhereInput[]
    OR?: OnboardingResponseWhereInput[]
    NOT?: OnboardingResponseWhereInput | OnboardingResponseWhereInput[]
    userId?: StringFilter<"OnboardingResponse"> | string
    email?: StringFilter<"OnboardingResponse"> | string
    clientFingerprint?: StringFilter<"OnboardingResponse"> | string
    intentTag?: EnumIntentTagFilter<"OnboardingResponse"> | $Enums.IntentTag
    orgSizeBracket?: EnumOrgSizeBracketFilter<"OnboardingResponse"> | $Enums.OrgSizeBracket
    tagVersionId?: StringFilter<"OnboardingResponse"> | string
    createdAt?: DateTimeFilter<"OnboardingResponse"> | Date | string
    tagVersion?: XOR<OnboardingTagVersionScalarRelationFilter, OnboardingTagVersionWhereInput>
    answers?: OnboardingAnswerListRelationFilter
  }, "id">

  export type OnboardingResponseOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    email?: SortOrder
    clientFingerprint?: SortOrder
    intentTag?: SortOrder
    orgSizeBracket?: SortOrder
    tagVersionId?: SortOrder
    createdAt?: SortOrder
    _count?: OnboardingResponseCountOrderByAggregateInput
    _max?: OnboardingResponseMaxOrderByAggregateInput
    _min?: OnboardingResponseMinOrderByAggregateInput
  }

  export type OnboardingResponseScalarWhereWithAggregatesInput = {
    AND?: OnboardingResponseScalarWhereWithAggregatesInput | OnboardingResponseScalarWhereWithAggregatesInput[]
    OR?: OnboardingResponseScalarWhereWithAggregatesInput[]
    NOT?: OnboardingResponseScalarWhereWithAggregatesInput | OnboardingResponseScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"OnboardingResponse"> | string
    userId?: StringWithAggregatesFilter<"OnboardingResponse"> | string
    email?: StringWithAggregatesFilter<"OnboardingResponse"> | string
    clientFingerprint?: StringWithAggregatesFilter<"OnboardingResponse"> | string
    intentTag?: EnumIntentTagWithAggregatesFilter<"OnboardingResponse"> | $Enums.IntentTag
    orgSizeBracket?: EnumOrgSizeBracketWithAggregatesFilter<"OnboardingResponse"> | $Enums.OrgSizeBracket
    tagVersionId?: StringWithAggregatesFilter<"OnboardingResponse"> | string
    createdAt?: DateTimeWithAggregatesFilter<"OnboardingResponse"> | Date | string
  }

  export type OnboardingAnswerWhereInput = {
    AND?: OnboardingAnswerWhereInput | OnboardingAnswerWhereInput[]
    OR?: OnboardingAnswerWhereInput[]
    NOT?: OnboardingAnswerWhereInput | OnboardingAnswerWhereInput[]
    id?: StringFilter<"OnboardingAnswer"> | string
    responseId?: StringFilter<"OnboardingAnswer"> | string
    questionId?: StringFilter<"OnboardingAnswer"> | string
    optionId?: StringNullableFilter<"OnboardingAnswer"> | string | null
    customValue?: StringNullableFilter<"OnboardingAnswer"> | string | null
    response?: XOR<OnboardingResponseScalarRelationFilter, OnboardingResponseWhereInput>
    question?: XOR<OnboardingQuestionScalarRelationFilter, OnboardingQuestionWhereInput>
    option?: XOR<OnboardingOptionNullableScalarRelationFilter, OnboardingOptionWhereInput> | null
  }

  export type OnboardingAnswerOrderByWithRelationInput = {
    id?: SortOrder
    responseId?: SortOrder
    questionId?: SortOrder
    optionId?: SortOrderInput | SortOrder
    customValue?: SortOrderInput | SortOrder
    response?: OnboardingResponseOrderByWithRelationInput
    question?: OnboardingQuestionOrderByWithRelationInput
    option?: OnboardingOptionOrderByWithRelationInput
  }

  export type OnboardingAnswerWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: OnboardingAnswerWhereInput | OnboardingAnswerWhereInput[]
    OR?: OnboardingAnswerWhereInput[]
    NOT?: OnboardingAnswerWhereInput | OnboardingAnswerWhereInput[]
    responseId?: StringFilter<"OnboardingAnswer"> | string
    questionId?: StringFilter<"OnboardingAnswer"> | string
    optionId?: StringNullableFilter<"OnboardingAnswer"> | string | null
    customValue?: StringNullableFilter<"OnboardingAnswer"> | string | null
    response?: XOR<OnboardingResponseScalarRelationFilter, OnboardingResponseWhereInput>
    question?: XOR<OnboardingQuestionScalarRelationFilter, OnboardingQuestionWhereInput>
    option?: XOR<OnboardingOptionNullableScalarRelationFilter, OnboardingOptionWhereInput> | null
  }, "id">

  export type OnboardingAnswerOrderByWithAggregationInput = {
    id?: SortOrder
    responseId?: SortOrder
    questionId?: SortOrder
    optionId?: SortOrderInput | SortOrder
    customValue?: SortOrderInput | SortOrder
    _count?: OnboardingAnswerCountOrderByAggregateInput
    _max?: OnboardingAnswerMaxOrderByAggregateInput
    _min?: OnboardingAnswerMinOrderByAggregateInput
  }

  export type OnboardingAnswerScalarWhereWithAggregatesInput = {
    AND?: OnboardingAnswerScalarWhereWithAggregatesInput | OnboardingAnswerScalarWhereWithAggregatesInput[]
    OR?: OnboardingAnswerScalarWhereWithAggregatesInput[]
    NOT?: OnboardingAnswerScalarWhereWithAggregatesInput | OnboardingAnswerScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"OnboardingAnswer"> | string
    responseId?: StringWithAggregatesFilter<"OnboardingAnswer"> | string
    questionId?: StringWithAggregatesFilter<"OnboardingAnswer"> | string
    optionId?: StringNullableWithAggregatesFilter<"OnboardingAnswer"> | string | null
    customValue?: StringNullableWithAggregatesFilter<"OnboardingAnswer"> | string | null
  }

  export type AdminAccountCreateInput = {
    id?: string
    name: string
    email: string
    picture?: string | null
    profileLink?: string | null
    designation?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    BlogPost?: BlogPostCreateNestedManyWithoutAuthorInput
  }

  export type AdminAccountUncheckedCreateInput = {
    id?: string
    name: string
    email: string
    picture?: string | null
    profileLink?: string | null
    designation?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    BlogPost?: BlogPostUncheckedCreateNestedManyWithoutAuthorInput
  }

  export type AdminAccountUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    picture?: NullableStringFieldUpdateOperationsInput | string | null
    profileLink?: NullableStringFieldUpdateOperationsInput | string | null
    designation?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    BlogPost?: BlogPostUpdateManyWithoutAuthorNestedInput
  }

  export type AdminAccountUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    picture?: NullableStringFieldUpdateOperationsInput | string | null
    profileLink?: NullableStringFieldUpdateOperationsInput | string | null
    designation?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    BlogPost?: BlogPostUncheckedUpdateManyWithoutAuthorNestedInput
  }

  export type AdminAccountCreateManyInput = {
    id?: string
    name: string
    email: string
    picture?: string | null
    profileLink?: string | null
    designation?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AdminAccountUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    picture?: NullableStringFieldUpdateOperationsInput | string | null
    profileLink?: NullableStringFieldUpdateOperationsInput | string | null
    designation?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AdminAccountUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    picture?: NullableStringFieldUpdateOperationsInput | string | null
    profileLink?: NullableStringFieldUpdateOperationsInput | string | null
    designation?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BlogPostCreateInput = {
    id?: string
    type?: $Enums.BlogPostType
    title: string
    slug: string
    status: $Enums.BlogPostStatus
    content: JsonNullValueInput | InputJsonValue
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tags?: BlogTagCreateNestedManyWithoutPostsInput
    author: AdminAccountCreateNestedOneWithoutBlogPostInput
    seo?: BlogSeoCreateNestedOneWithoutBlogPostInput
  }

  export type BlogPostUncheckedCreateInput = {
    id?: string
    type?: $Enums.BlogPostType
    title: string
    slug: string
    authorId: string
    status: $Enums.BlogPostStatus
    content: JsonNullValueInput | InputJsonValue
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tags?: BlogTagUncheckedCreateNestedManyWithoutPostsInput
    seo?: BlogSeoUncheckedCreateNestedOneWithoutBlogPostInput
  }

  export type BlogPostUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumBlogPostTypeFieldUpdateOperationsInput | $Enums.BlogPostType
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    status?: EnumBlogPostStatusFieldUpdateOperationsInput | $Enums.BlogPostStatus
    content?: JsonNullValueInput | InputJsonValue
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tags?: BlogTagUpdateManyWithoutPostsNestedInput
    author?: AdminAccountUpdateOneRequiredWithoutBlogPostNestedInput
    seo?: BlogSeoUpdateOneWithoutBlogPostNestedInput
  }

  export type BlogPostUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumBlogPostTypeFieldUpdateOperationsInput | $Enums.BlogPostType
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    authorId?: StringFieldUpdateOperationsInput | string
    status?: EnumBlogPostStatusFieldUpdateOperationsInput | $Enums.BlogPostStatus
    content?: JsonNullValueInput | InputJsonValue
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tags?: BlogTagUncheckedUpdateManyWithoutPostsNestedInput
    seo?: BlogSeoUncheckedUpdateOneWithoutBlogPostNestedInput
  }

  export type BlogPostCreateManyInput = {
    id?: string
    type?: $Enums.BlogPostType
    title: string
    slug: string
    authorId: string
    status: $Enums.BlogPostStatus
    content: JsonNullValueInput | InputJsonValue
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BlogPostUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumBlogPostTypeFieldUpdateOperationsInput | $Enums.BlogPostType
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    status?: EnumBlogPostStatusFieldUpdateOperationsInput | $Enums.BlogPostStatus
    content?: JsonNullValueInput | InputJsonValue
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BlogPostUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumBlogPostTypeFieldUpdateOperationsInput | $Enums.BlogPostType
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    authorId?: StringFieldUpdateOperationsInput | string
    status?: EnumBlogPostStatusFieldUpdateOperationsInput | $Enums.BlogPostStatus
    content?: JsonNullValueInput | InputJsonValue
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BlogTagCreateInput = {
    id?: string
    tag: string
    createdAt?: Date | string
    updatedAt?: Date | string
    posts?: BlogPostCreateNestedManyWithoutTagsInput
  }

  export type BlogTagUncheckedCreateInput = {
    id?: string
    tag: string
    createdAt?: Date | string
    updatedAt?: Date | string
    posts?: BlogPostUncheckedCreateNestedManyWithoutTagsInput
  }

  export type BlogTagUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tag?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    posts?: BlogPostUpdateManyWithoutTagsNestedInput
  }

  export type BlogTagUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tag?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    posts?: BlogPostUncheckedUpdateManyWithoutTagsNestedInput
  }

  export type BlogTagCreateManyInput = {
    id?: string
    tag: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BlogTagUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tag?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BlogTagUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tag?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BlogSeoCreateInput = {
    id?: string
    metaTitle?: string | null
    metaDescription?: string | null
    metaRobots?: string | null
    keywords?: string | null
    canonicalUrl?: string | null
    ogTitle?: string | null
    ogDescription?: string | null
    ogImage?: string | null
    ogUrl?: string | null
    ogType?: string | null
    ogSiteName?: string | null
    twitterCardType?: string | null
    twitterTitle?: string | null
    twitterDescription?: string | null
    twitterImage?: string | null
    twitterSite?: string | null
    blogpostingHeadline?: string | null
    blogpostingDescription?: string | null
    blogpostingAuthorName?: string | null
    blogpostingAuthorUrl?: string | null
    blogpostingPublisherName?: string | null
    blogpostingPublisherLogo?: string | null
    blogpostingKeywords?: string | null
    blogpostingFeaturedImage?: string | null
    mainEntityOfPage?: string | null
    favicon?: string | null
    language?: string | null
    faqEnabled?: boolean
    faqData?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    blogPost: BlogPostCreateNestedOneWithoutSeoInput
  }

  export type BlogSeoUncheckedCreateInput = {
    id?: string
    metaTitle?: string | null
    metaDescription?: string | null
    metaRobots?: string | null
    keywords?: string | null
    canonicalUrl?: string | null
    ogTitle?: string | null
    ogDescription?: string | null
    ogImage?: string | null
    ogUrl?: string | null
    ogType?: string | null
    ogSiteName?: string | null
    twitterCardType?: string | null
    twitterTitle?: string | null
    twitterDescription?: string | null
    twitterImage?: string | null
    twitterSite?: string | null
    blogpostingHeadline?: string | null
    blogpostingDescription?: string | null
    blogpostingAuthorName?: string | null
    blogpostingAuthorUrl?: string | null
    blogpostingPublisherName?: string | null
    blogpostingPublisherLogo?: string | null
    blogpostingKeywords?: string | null
    blogpostingFeaturedImage?: string | null
    mainEntityOfPage?: string | null
    favicon?: string | null
    language?: string | null
    faqEnabled?: boolean
    faqData?: NullableJsonNullValueInput | InputJsonValue
    blogPostId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BlogSeoUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    metaRobots?: NullableStringFieldUpdateOperationsInput | string | null
    keywords?: NullableStringFieldUpdateOperationsInput | string | null
    canonicalUrl?: NullableStringFieldUpdateOperationsInput | string | null
    ogTitle?: NullableStringFieldUpdateOperationsInput | string | null
    ogDescription?: NullableStringFieldUpdateOperationsInput | string | null
    ogImage?: NullableStringFieldUpdateOperationsInput | string | null
    ogUrl?: NullableStringFieldUpdateOperationsInput | string | null
    ogType?: NullableStringFieldUpdateOperationsInput | string | null
    ogSiteName?: NullableStringFieldUpdateOperationsInput | string | null
    twitterCardType?: NullableStringFieldUpdateOperationsInput | string | null
    twitterTitle?: NullableStringFieldUpdateOperationsInput | string | null
    twitterDescription?: NullableStringFieldUpdateOperationsInput | string | null
    twitterImage?: NullableStringFieldUpdateOperationsInput | string | null
    twitterSite?: NullableStringFieldUpdateOperationsInput | string | null
    blogpostingHeadline?: NullableStringFieldUpdateOperationsInput | string | null
    blogpostingDescription?: NullableStringFieldUpdateOperationsInput | string | null
    blogpostingAuthorName?: NullableStringFieldUpdateOperationsInput | string | null
    blogpostingAuthorUrl?: NullableStringFieldUpdateOperationsInput | string | null
    blogpostingPublisherName?: NullableStringFieldUpdateOperationsInput | string | null
    blogpostingPublisherLogo?: NullableStringFieldUpdateOperationsInput | string | null
    blogpostingKeywords?: NullableStringFieldUpdateOperationsInput | string | null
    blogpostingFeaturedImage?: NullableStringFieldUpdateOperationsInput | string | null
    mainEntityOfPage?: NullableStringFieldUpdateOperationsInput | string | null
    favicon?: NullableStringFieldUpdateOperationsInput | string | null
    language?: NullableStringFieldUpdateOperationsInput | string | null
    faqEnabled?: BoolFieldUpdateOperationsInput | boolean
    faqData?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    blogPost?: BlogPostUpdateOneRequiredWithoutSeoNestedInput
  }

  export type BlogSeoUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    metaRobots?: NullableStringFieldUpdateOperationsInput | string | null
    keywords?: NullableStringFieldUpdateOperationsInput | string | null
    canonicalUrl?: NullableStringFieldUpdateOperationsInput | string | null
    ogTitle?: NullableStringFieldUpdateOperationsInput | string | null
    ogDescription?: NullableStringFieldUpdateOperationsInput | string | null
    ogImage?: NullableStringFieldUpdateOperationsInput | string | null
    ogUrl?: NullableStringFieldUpdateOperationsInput | string | null
    ogType?: NullableStringFieldUpdateOperationsInput | string | null
    ogSiteName?: NullableStringFieldUpdateOperationsInput | string | null
    twitterCardType?: NullableStringFieldUpdateOperationsInput | string | null
    twitterTitle?: NullableStringFieldUpdateOperationsInput | string | null
    twitterDescription?: NullableStringFieldUpdateOperationsInput | string | null
    twitterImage?: NullableStringFieldUpdateOperationsInput | string | null
    twitterSite?: NullableStringFieldUpdateOperationsInput | string | null
    blogpostingHeadline?: NullableStringFieldUpdateOperationsInput | string | null
    blogpostingDescription?: NullableStringFieldUpdateOperationsInput | string | null
    blogpostingAuthorName?: NullableStringFieldUpdateOperationsInput | string | null
    blogpostingAuthorUrl?: NullableStringFieldUpdateOperationsInput | string | null
    blogpostingPublisherName?: NullableStringFieldUpdateOperationsInput | string | null
    blogpostingPublisherLogo?: NullableStringFieldUpdateOperationsInput | string | null
    blogpostingKeywords?: NullableStringFieldUpdateOperationsInput | string | null
    blogpostingFeaturedImage?: NullableStringFieldUpdateOperationsInput | string | null
    mainEntityOfPage?: NullableStringFieldUpdateOperationsInput | string | null
    favicon?: NullableStringFieldUpdateOperationsInput | string | null
    language?: NullableStringFieldUpdateOperationsInput | string | null
    faqEnabled?: BoolFieldUpdateOperationsInput | boolean
    faqData?: NullableJsonNullValueInput | InputJsonValue
    blogPostId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BlogSeoCreateManyInput = {
    id?: string
    metaTitle?: string | null
    metaDescription?: string | null
    metaRobots?: string | null
    keywords?: string | null
    canonicalUrl?: string | null
    ogTitle?: string | null
    ogDescription?: string | null
    ogImage?: string | null
    ogUrl?: string | null
    ogType?: string | null
    ogSiteName?: string | null
    twitterCardType?: string | null
    twitterTitle?: string | null
    twitterDescription?: string | null
    twitterImage?: string | null
    twitterSite?: string | null
    blogpostingHeadline?: string | null
    blogpostingDescription?: string | null
    blogpostingAuthorName?: string | null
    blogpostingAuthorUrl?: string | null
    blogpostingPublisherName?: string | null
    blogpostingPublisherLogo?: string | null
    blogpostingKeywords?: string | null
    blogpostingFeaturedImage?: string | null
    mainEntityOfPage?: string | null
    favicon?: string | null
    language?: string | null
    faqEnabled?: boolean
    faqData?: NullableJsonNullValueInput | InputJsonValue
    blogPostId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BlogSeoUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    metaRobots?: NullableStringFieldUpdateOperationsInput | string | null
    keywords?: NullableStringFieldUpdateOperationsInput | string | null
    canonicalUrl?: NullableStringFieldUpdateOperationsInput | string | null
    ogTitle?: NullableStringFieldUpdateOperationsInput | string | null
    ogDescription?: NullableStringFieldUpdateOperationsInput | string | null
    ogImage?: NullableStringFieldUpdateOperationsInput | string | null
    ogUrl?: NullableStringFieldUpdateOperationsInput | string | null
    ogType?: NullableStringFieldUpdateOperationsInput | string | null
    ogSiteName?: NullableStringFieldUpdateOperationsInput | string | null
    twitterCardType?: NullableStringFieldUpdateOperationsInput | string | null
    twitterTitle?: NullableStringFieldUpdateOperationsInput | string | null
    twitterDescription?: NullableStringFieldUpdateOperationsInput | string | null
    twitterImage?: NullableStringFieldUpdateOperationsInput | string | null
    twitterSite?: NullableStringFieldUpdateOperationsInput | string | null
    blogpostingHeadline?: NullableStringFieldUpdateOperationsInput | string | null
    blogpostingDescription?: NullableStringFieldUpdateOperationsInput | string | null
    blogpostingAuthorName?: NullableStringFieldUpdateOperationsInput | string | null
    blogpostingAuthorUrl?: NullableStringFieldUpdateOperationsInput | string | null
    blogpostingPublisherName?: NullableStringFieldUpdateOperationsInput | string | null
    blogpostingPublisherLogo?: NullableStringFieldUpdateOperationsInput | string | null
    blogpostingKeywords?: NullableStringFieldUpdateOperationsInput | string | null
    blogpostingFeaturedImage?: NullableStringFieldUpdateOperationsInput | string | null
    mainEntityOfPage?: NullableStringFieldUpdateOperationsInput | string | null
    favicon?: NullableStringFieldUpdateOperationsInput | string | null
    language?: NullableStringFieldUpdateOperationsInput | string | null
    faqEnabled?: BoolFieldUpdateOperationsInput | boolean
    faqData?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BlogSeoUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    metaRobots?: NullableStringFieldUpdateOperationsInput | string | null
    keywords?: NullableStringFieldUpdateOperationsInput | string | null
    canonicalUrl?: NullableStringFieldUpdateOperationsInput | string | null
    ogTitle?: NullableStringFieldUpdateOperationsInput | string | null
    ogDescription?: NullableStringFieldUpdateOperationsInput | string | null
    ogImage?: NullableStringFieldUpdateOperationsInput | string | null
    ogUrl?: NullableStringFieldUpdateOperationsInput | string | null
    ogType?: NullableStringFieldUpdateOperationsInput | string | null
    ogSiteName?: NullableStringFieldUpdateOperationsInput | string | null
    twitterCardType?: NullableStringFieldUpdateOperationsInput | string | null
    twitterTitle?: NullableStringFieldUpdateOperationsInput | string | null
    twitterDescription?: NullableStringFieldUpdateOperationsInput | string | null
    twitterImage?: NullableStringFieldUpdateOperationsInput | string | null
    twitterSite?: NullableStringFieldUpdateOperationsInput | string | null
    blogpostingHeadline?: NullableStringFieldUpdateOperationsInput | string | null
    blogpostingDescription?: NullableStringFieldUpdateOperationsInput | string | null
    blogpostingAuthorName?: NullableStringFieldUpdateOperationsInput | string | null
    blogpostingAuthorUrl?: NullableStringFieldUpdateOperationsInput | string | null
    blogpostingPublisherName?: NullableStringFieldUpdateOperationsInput | string | null
    blogpostingPublisherLogo?: NullableStringFieldUpdateOperationsInput | string | null
    blogpostingKeywords?: NullableStringFieldUpdateOperationsInput | string | null
    blogpostingFeaturedImage?: NullableStringFieldUpdateOperationsInput | string | null
    mainEntityOfPage?: NullableStringFieldUpdateOperationsInput | string | null
    favicon?: NullableStringFieldUpdateOperationsInput | string | null
    language?: NullableStringFieldUpdateOperationsInput | string | null
    faqEnabled?: BoolFieldUpdateOperationsInput | boolean
    faqData?: NullableJsonNullValueInput | InputJsonValue
    blogPostId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OnboardingTagVersionCreateInput = {
    id?: string
    tag: string
    title: string
    description?: string | null
    status?: $Enums.TagStatus
    createdAt?: Date | string
    publishedAt?: Date | string | null
    questions?: OnboardingQuestionCreateNestedManyWithoutVersionInput
    responses?: OnboardingResponseCreateNestedManyWithoutTagVersionInput
  }

  export type OnboardingTagVersionUncheckedCreateInput = {
    id?: string
    tag: string
    title: string
    description?: string | null
    status?: $Enums.TagStatus
    createdAt?: Date | string
    publishedAt?: Date | string | null
    questions?: OnboardingQuestionUncheckedCreateNestedManyWithoutVersionInput
    responses?: OnboardingResponseUncheckedCreateNestedManyWithoutTagVersionInput
  }

  export type OnboardingTagVersionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tag?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumTagStatusFieldUpdateOperationsInput | $Enums.TagStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    questions?: OnboardingQuestionUpdateManyWithoutVersionNestedInput
    responses?: OnboardingResponseUpdateManyWithoutTagVersionNestedInput
  }

  export type OnboardingTagVersionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tag?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumTagStatusFieldUpdateOperationsInput | $Enums.TagStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    questions?: OnboardingQuestionUncheckedUpdateManyWithoutVersionNestedInput
    responses?: OnboardingResponseUncheckedUpdateManyWithoutTagVersionNestedInput
  }

  export type OnboardingTagVersionCreateManyInput = {
    id?: string
    tag: string
    title: string
    description?: string | null
    status?: $Enums.TagStatus
    createdAt?: Date | string
    publishedAt?: Date | string | null
  }

  export type OnboardingTagVersionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tag?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumTagStatusFieldUpdateOperationsInput | $Enums.TagStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type OnboardingTagVersionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tag?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumTagStatusFieldUpdateOperationsInput | $Enums.TagStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type OnboardingQuestionCreateInput = {
    id?: string
    slug: string
    type: $Enums.QuestionType
    title: string
    iconSlug?: string | null
    isActive?: boolean
    sortOrder?: number
    allowOtherOption?: boolean
    createdAt?: Date | string
    version: OnboardingTagVersionCreateNestedOneWithoutQuestionsInput
    options?: OnboardingOptionCreateNestedManyWithoutQuestionInput
    answers?: OnboardingAnswerCreateNestedManyWithoutQuestionInput
  }

  export type OnboardingQuestionUncheckedCreateInput = {
    id?: string
    versionId: string
    slug: string
    type: $Enums.QuestionType
    title: string
    iconSlug?: string | null
    isActive?: boolean
    sortOrder?: number
    allowOtherOption?: boolean
    createdAt?: Date | string
    options?: OnboardingOptionUncheckedCreateNestedManyWithoutQuestionInput
    answers?: OnboardingAnswerUncheckedCreateNestedManyWithoutQuestionInput
  }

  export type OnboardingQuestionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    type?: EnumQuestionTypeFieldUpdateOperationsInput | $Enums.QuestionType
    title?: StringFieldUpdateOperationsInput | string
    iconSlug?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    allowOtherOption?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    version?: OnboardingTagVersionUpdateOneRequiredWithoutQuestionsNestedInput
    options?: OnboardingOptionUpdateManyWithoutQuestionNestedInput
    answers?: OnboardingAnswerUpdateManyWithoutQuestionNestedInput
  }

  export type OnboardingQuestionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    versionId?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    type?: EnumQuestionTypeFieldUpdateOperationsInput | $Enums.QuestionType
    title?: StringFieldUpdateOperationsInput | string
    iconSlug?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    allowOtherOption?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    options?: OnboardingOptionUncheckedUpdateManyWithoutQuestionNestedInput
    answers?: OnboardingAnswerUncheckedUpdateManyWithoutQuestionNestedInput
  }

  export type OnboardingQuestionCreateManyInput = {
    id?: string
    versionId: string
    slug: string
    type: $Enums.QuestionType
    title: string
    iconSlug?: string | null
    isActive?: boolean
    sortOrder?: number
    allowOtherOption?: boolean
    createdAt?: Date | string
  }

  export type OnboardingQuestionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    type?: EnumQuestionTypeFieldUpdateOperationsInput | $Enums.QuestionType
    title?: StringFieldUpdateOperationsInput | string
    iconSlug?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    allowOtherOption?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OnboardingQuestionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    versionId?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    type?: EnumQuestionTypeFieldUpdateOperationsInput | $Enums.QuestionType
    title?: StringFieldUpdateOperationsInput | string
    iconSlug?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    allowOtherOption?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OnboardingOptionCreateInput = {
    id?: string
    value: string
    label: string
    iconSlug?: string | null
    sortOrder?: number | null
    question: OnboardingQuestionCreateNestedOneWithoutOptionsInput
    answers?: OnboardingAnswerCreateNestedManyWithoutOptionInput
  }

  export type OnboardingOptionUncheckedCreateInput = {
    id?: string
    questionId: string
    value: string
    label: string
    iconSlug?: string | null
    sortOrder?: number | null
    answers?: OnboardingAnswerUncheckedCreateNestedManyWithoutOptionInput
  }

  export type OnboardingOptionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    iconSlug?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: NullableIntFieldUpdateOperationsInput | number | null
    question?: OnboardingQuestionUpdateOneRequiredWithoutOptionsNestedInput
    answers?: OnboardingAnswerUpdateManyWithoutOptionNestedInput
  }

  export type OnboardingOptionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    questionId?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    iconSlug?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: NullableIntFieldUpdateOperationsInput | number | null
    answers?: OnboardingAnswerUncheckedUpdateManyWithoutOptionNestedInput
  }

  export type OnboardingOptionCreateManyInput = {
    id?: string
    questionId: string
    value: string
    label: string
    iconSlug?: string | null
    sortOrder?: number | null
  }

  export type OnboardingOptionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    iconSlug?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type OnboardingOptionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    questionId?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    iconSlug?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type OnboardingResponseCreateInput = {
    id?: string
    userId: string
    email: string
    clientFingerprint: string
    intentTag: $Enums.IntentTag
    orgSizeBracket: $Enums.OrgSizeBracket
    createdAt?: Date | string
    tagVersion: OnboardingTagVersionCreateNestedOneWithoutResponsesInput
    answers?: OnboardingAnswerCreateNestedManyWithoutResponseInput
  }

  export type OnboardingResponseUncheckedCreateInput = {
    id?: string
    userId: string
    email: string
    clientFingerprint: string
    intentTag: $Enums.IntentTag
    orgSizeBracket: $Enums.OrgSizeBracket
    tagVersionId: string
    createdAt?: Date | string
    answers?: OnboardingAnswerUncheckedCreateNestedManyWithoutResponseInput
  }

  export type OnboardingResponseUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    clientFingerprint?: StringFieldUpdateOperationsInput | string
    intentTag?: EnumIntentTagFieldUpdateOperationsInput | $Enums.IntentTag
    orgSizeBracket?: EnumOrgSizeBracketFieldUpdateOperationsInput | $Enums.OrgSizeBracket
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tagVersion?: OnboardingTagVersionUpdateOneRequiredWithoutResponsesNestedInput
    answers?: OnboardingAnswerUpdateManyWithoutResponseNestedInput
  }

  export type OnboardingResponseUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    clientFingerprint?: StringFieldUpdateOperationsInput | string
    intentTag?: EnumIntentTagFieldUpdateOperationsInput | $Enums.IntentTag
    orgSizeBracket?: EnumOrgSizeBracketFieldUpdateOperationsInput | $Enums.OrgSizeBracket
    tagVersionId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    answers?: OnboardingAnswerUncheckedUpdateManyWithoutResponseNestedInput
  }

  export type OnboardingResponseCreateManyInput = {
    id?: string
    userId: string
    email: string
    clientFingerprint: string
    intentTag: $Enums.IntentTag
    orgSizeBracket: $Enums.OrgSizeBracket
    tagVersionId: string
    createdAt?: Date | string
  }

  export type OnboardingResponseUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    clientFingerprint?: StringFieldUpdateOperationsInput | string
    intentTag?: EnumIntentTagFieldUpdateOperationsInput | $Enums.IntentTag
    orgSizeBracket?: EnumOrgSizeBracketFieldUpdateOperationsInput | $Enums.OrgSizeBracket
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OnboardingResponseUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    clientFingerprint?: StringFieldUpdateOperationsInput | string
    intentTag?: EnumIntentTagFieldUpdateOperationsInput | $Enums.IntentTag
    orgSizeBracket?: EnumOrgSizeBracketFieldUpdateOperationsInput | $Enums.OrgSizeBracket
    tagVersionId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OnboardingAnswerCreateInput = {
    id?: string
    customValue?: string | null
    response: OnboardingResponseCreateNestedOneWithoutAnswersInput
    question: OnboardingQuestionCreateNestedOneWithoutAnswersInput
    option?: OnboardingOptionCreateNestedOneWithoutAnswersInput
  }

  export type OnboardingAnswerUncheckedCreateInput = {
    id?: string
    responseId: string
    questionId: string
    optionId?: string | null
    customValue?: string | null
  }

  export type OnboardingAnswerUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    customValue?: NullableStringFieldUpdateOperationsInput | string | null
    response?: OnboardingResponseUpdateOneRequiredWithoutAnswersNestedInput
    question?: OnboardingQuestionUpdateOneRequiredWithoutAnswersNestedInput
    option?: OnboardingOptionUpdateOneWithoutAnswersNestedInput
  }

  export type OnboardingAnswerUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    responseId?: StringFieldUpdateOperationsInput | string
    questionId?: StringFieldUpdateOperationsInput | string
    optionId?: NullableStringFieldUpdateOperationsInput | string | null
    customValue?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type OnboardingAnswerCreateManyInput = {
    id?: string
    responseId: string
    questionId: string
    optionId?: string | null
    customValue?: string | null
  }

  export type OnboardingAnswerUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    customValue?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type OnboardingAnswerUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    responseId?: StringFieldUpdateOperationsInput | string
    questionId?: StringFieldUpdateOperationsInput | string
    optionId?: NullableStringFieldUpdateOperationsInput | string | null
    customValue?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type BlogPostListRelationFilter = {
    every?: BlogPostWhereInput
    some?: BlogPostWhereInput
    none?: BlogPostWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type BlogPostOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AdminAccountCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    picture?: SortOrder
    profileLink?: SortOrder
    designation?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AdminAccountMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    picture?: SortOrder
    profileLink?: SortOrder
    designation?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AdminAccountMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    picture?: SortOrder
    profileLink?: SortOrder
    designation?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type EnumBlogPostTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.BlogPostType | EnumBlogPostTypeFieldRefInput<$PrismaModel>
    in?: $Enums.BlogPostType[] | ListEnumBlogPostTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.BlogPostType[] | ListEnumBlogPostTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumBlogPostTypeFilter<$PrismaModel> | $Enums.BlogPostType
  }

  export type EnumBlogPostStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.BlogPostStatus | EnumBlogPostStatusFieldRefInput<$PrismaModel>
    in?: $Enums.BlogPostStatus[] | ListEnumBlogPostStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.BlogPostStatus[] | ListEnumBlogPostStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumBlogPostStatusFilter<$PrismaModel> | $Enums.BlogPostStatus
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type BlogTagListRelationFilter = {
    every?: BlogTagWhereInput
    some?: BlogTagWhereInput
    none?: BlogTagWhereInput
  }

  export type AdminAccountScalarRelationFilter = {
    is?: AdminAccountWhereInput
    isNot?: AdminAccountWhereInput
  }

  export type BlogSeoNullableScalarRelationFilter = {
    is?: BlogSeoWhereInput | null
    isNot?: BlogSeoWhereInput | null
  }

  export type BlogTagOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type BlogPostCountOrderByAggregateInput = {
    id?: SortOrder
    type?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    authorId?: SortOrder
    status?: SortOrder
    content?: SortOrder
    deletedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BlogPostMaxOrderByAggregateInput = {
    id?: SortOrder
    type?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    authorId?: SortOrder
    status?: SortOrder
    deletedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BlogPostMinOrderByAggregateInput = {
    id?: SortOrder
    type?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    authorId?: SortOrder
    status?: SortOrder
    deletedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumBlogPostTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.BlogPostType | EnumBlogPostTypeFieldRefInput<$PrismaModel>
    in?: $Enums.BlogPostType[] | ListEnumBlogPostTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.BlogPostType[] | ListEnumBlogPostTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumBlogPostTypeWithAggregatesFilter<$PrismaModel> | $Enums.BlogPostType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumBlogPostTypeFilter<$PrismaModel>
    _max?: NestedEnumBlogPostTypeFilter<$PrismaModel>
  }

  export type EnumBlogPostStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.BlogPostStatus | EnumBlogPostStatusFieldRefInput<$PrismaModel>
    in?: $Enums.BlogPostStatus[] | ListEnumBlogPostStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.BlogPostStatus[] | ListEnumBlogPostStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumBlogPostStatusWithAggregatesFilter<$PrismaModel> | $Enums.BlogPostStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumBlogPostStatusFilter<$PrismaModel>
    _max?: NestedEnumBlogPostStatusFilter<$PrismaModel>
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type BlogTagCountOrderByAggregateInput = {
    id?: SortOrder
    tag?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BlogTagMaxOrderByAggregateInput = {
    id?: SortOrder
    tag?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BlogTagMinOrderByAggregateInput = {
    id?: SortOrder
    tag?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type BlogPostScalarRelationFilter = {
    is?: BlogPostWhereInput
    isNot?: BlogPostWhereInput
  }

  export type BlogSeoCountOrderByAggregateInput = {
    id?: SortOrder
    metaTitle?: SortOrder
    metaDescription?: SortOrder
    metaRobots?: SortOrder
    keywords?: SortOrder
    canonicalUrl?: SortOrder
    ogTitle?: SortOrder
    ogDescription?: SortOrder
    ogImage?: SortOrder
    ogUrl?: SortOrder
    ogType?: SortOrder
    ogSiteName?: SortOrder
    twitterCardType?: SortOrder
    twitterTitle?: SortOrder
    twitterDescription?: SortOrder
    twitterImage?: SortOrder
    twitterSite?: SortOrder
    blogpostingHeadline?: SortOrder
    blogpostingDescription?: SortOrder
    blogpostingAuthorName?: SortOrder
    blogpostingAuthorUrl?: SortOrder
    blogpostingPublisherName?: SortOrder
    blogpostingPublisherLogo?: SortOrder
    blogpostingKeywords?: SortOrder
    blogpostingFeaturedImage?: SortOrder
    mainEntityOfPage?: SortOrder
    favicon?: SortOrder
    language?: SortOrder
    faqEnabled?: SortOrder
    faqData?: SortOrder
    blogPostId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BlogSeoMaxOrderByAggregateInput = {
    id?: SortOrder
    metaTitle?: SortOrder
    metaDescription?: SortOrder
    metaRobots?: SortOrder
    keywords?: SortOrder
    canonicalUrl?: SortOrder
    ogTitle?: SortOrder
    ogDescription?: SortOrder
    ogImage?: SortOrder
    ogUrl?: SortOrder
    ogType?: SortOrder
    ogSiteName?: SortOrder
    twitterCardType?: SortOrder
    twitterTitle?: SortOrder
    twitterDescription?: SortOrder
    twitterImage?: SortOrder
    twitterSite?: SortOrder
    blogpostingHeadline?: SortOrder
    blogpostingDescription?: SortOrder
    blogpostingAuthorName?: SortOrder
    blogpostingAuthorUrl?: SortOrder
    blogpostingPublisherName?: SortOrder
    blogpostingPublisherLogo?: SortOrder
    blogpostingKeywords?: SortOrder
    blogpostingFeaturedImage?: SortOrder
    mainEntityOfPage?: SortOrder
    favicon?: SortOrder
    language?: SortOrder
    faqEnabled?: SortOrder
    blogPostId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BlogSeoMinOrderByAggregateInput = {
    id?: SortOrder
    metaTitle?: SortOrder
    metaDescription?: SortOrder
    metaRobots?: SortOrder
    keywords?: SortOrder
    canonicalUrl?: SortOrder
    ogTitle?: SortOrder
    ogDescription?: SortOrder
    ogImage?: SortOrder
    ogUrl?: SortOrder
    ogType?: SortOrder
    ogSiteName?: SortOrder
    twitterCardType?: SortOrder
    twitterTitle?: SortOrder
    twitterDescription?: SortOrder
    twitterImage?: SortOrder
    twitterSite?: SortOrder
    blogpostingHeadline?: SortOrder
    blogpostingDescription?: SortOrder
    blogpostingAuthorName?: SortOrder
    blogpostingAuthorUrl?: SortOrder
    blogpostingPublisherName?: SortOrder
    blogpostingPublisherLogo?: SortOrder
    blogpostingKeywords?: SortOrder
    blogpostingFeaturedImage?: SortOrder
    mainEntityOfPage?: SortOrder
    favicon?: SortOrder
    language?: SortOrder
    faqEnabled?: SortOrder
    blogPostId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type EnumTagStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.TagStatus | EnumTagStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TagStatus[] | ListEnumTagStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TagStatus[] | ListEnumTagStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTagStatusFilter<$PrismaModel> | $Enums.TagStatus
  }

  export type OnboardingQuestionListRelationFilter = {
    every?: OnboardingQuestionWhereInput
    some?: OnboardingQuestionWhereInput
    none?: OnboardingQuestionWhereInput
  }

  export type OnboardingResponseListRelationFilter = {
    every?: OnboardingResponseWhereInput
    some?: OnboardingResponseWhereInput
    none?: OnboardingResponseWhereInput
  }

  export type OnboardingQuestionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OnboardingResponseOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OnboardingTagVersionCountOrderByAggregateInput = {
    id?: SortOrder
    tag?: SortOrder
    title?: SortOrder
    description?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    publishedAt?: SortOrder
  }

  export type OnboardingTagVersionMaxOrderByAggregateInput = {
    id?: SortOrder
    tag?: SortOrder
    title?: SortOrder
    description?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    publishedAt?: SortOrder
  }

  export type OnboardingTagVersionMinOrderByAggregateInput = {
    id?: SortOrder
    tag?: SortOrder
    title?: SortOrder
    description?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    publishedAt?: SortOrder
  }

  export type EnumTagStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TagStatus | EnumTagStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TagStatus[] | ListEnumTagStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TagStatus[] | ListEnumTagStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTagStatusWithAggregatesFilter<$PrismaModel> | $Enums.TagStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTagStatusFilter<$PrismaModel>
    _max?: NestedEnumTagStatusFilter<$PrismaModel>
  }

  export type EnumQuestionTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.QuestionType | EnumQuestionTypeFieldRefInput<$PrismaModel>
    in?: $Enums.QuestionType[] | ListEnumQuestionTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.QuestionType[] | ListEnumQuestionTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumQuestionTypeFilter<$PrismaModel> | $Enums.QuestionType
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type OnboardingTagVersionScalarRelationFilter = {
    is?: OnboardingTagVersionWhereInput
    isNot?: OnboardingTagVersionWhereInput
  }

  export type OnboardingOptionListRelationFilter = {
    every?: OnboardingOptionWhereInput
    some?: OnboardingOptionWhereInput
    none?: OnboardingOptionWhereInput
  }

  export type OnboardingAnswerListRelationFilter = {
    every?: OnboardingAnswerWhereInput
    some?: OnboardingAnswerWhereInput
    none?: OnboardingAnswerWhereInput
  }

  export type OnboardingOptionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OnboardingAnswerOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OnboardingQuestionCountOrderByAggregateInput = {
    id?: SortOrder
    versionId?: SortOrder
    slug?: SortOrder
    type?: SortOrder
    title?: SortOrder
    iconSlug?: SortOrder
    isActive?: SortOrder
    sortOrder?: SortOrder
    allowOtherOption?: SortOrder
    createdAt?: SortOrder
  }

  export type OnboardingQuestionAvgOrderByAggregateInput = {
    sortOrder?: SortOrder
  }

  export type OnboardingQuestionMaxOrderByAggregateInput = {
    id?: SortOrder
    versionId?: SortOrder
    slug?: SortOrder
    type?: SortOrder
    title?: SortOrder
    iconSlug?: SortOrder
    isActive?: SortOrder
    sortOrder?: SortOrder
    allowOtherOption?: SortOrder
    createdAt?: SortOrder
  }

  export type OnboardingQuestionMinOrderByAggregateInput = {
    id?: SortOrder
    versionId?: SortOrder
    slug?: SortOrder
    type?: SortOrder
    title?: SortOrder
    iconSlug?: SortOrder
    isActive?: SortOrder
    sortOrder?: SortOrder
    allowOtherOption?: SortOrder
    createdAt?: SortOrder
  }

  export type OnboardingQuestionSumOrderByAggregateInput = {
    sortOrder?: SortOrder
  }

  export type EnumQuestionTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.QuestionType | EnumQuestionTypeFieldRefInput<$PrismaModel>
    in?: $Enums.QuestionType[] | ListEnumQuestionTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.QuestionType[] | ListEnumQuestionTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumQuestionTypeWithAggregatesFilter<$PrismaModel> | $Enums.QuestionType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumQuestionTypeFilter<$PrismaModel>
    _max?: NestedEnumQuestionTypeFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type OnboardingQuestionScalarRelationFilter = {
    is?: OnboardingQuestionWhereInput
    isNot?: OnboardingQuestionWhereInput
  }

  export type OnboardingOptionCountOrderByAggregateInput = {
    id?: SortOrder
    questionId?: SortOrder
    value?: SortOrder
    label?: SortOrder
    iconSlug?: SortOrder
    sortOrder?: SortOrder
  }

  export type OnboardingOptionAvgOrderByAggregateInput = {
    sortOrder?: SortOrder
  }

  export type OnboardingOptionMaxOrderByAggregateInput = {
    id?: SortOrder
    questionId?: SortOrder
    value?: SortOrder
    label?: SortOrder
    iconSlug?: SortOrder
    sortOrder?: SortOrder
  }

  export type OnboardingOptionMinOrderByAggregateInput = {
    id?: SortOrder
    questionId?: SortOrder
    value?: SortOrder
    label?: SortOrder
    iconSlug?: SortOrder
    sortOrder?: SortOrder
  }

  export type OnboardingOptionSumOrderByAggregateInput = {
    sortOrder?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type EnumIntentTagFilter<$PrismaModel = never> = {
    equals?: $Enums.IntentTag | EnumIntentTagFieldRefInput<$PrismaModel>
    in?: $Enums.IntentTag[] | ListEnumIntentTagFieldRefInput<$PrismaModel>
    notIn?: $Enums.IntentTag[] | ListEnumIntentTagFieldRefInput<$PrismaModel>
    not?: NestedEnumIntentTagFilter<$PrismaModel> | $Enums.IntentTag
  }

  export type EnumOrgSizeBracketFilter<$PrismaModel = never> = {
    equals?: $Enums.OrgSizeBracket | EnumOrgSizeBracketFieldRefInput<$PrismaModel>
    in?: $Enums.OrgSizeBracket[] | ListEnumOrgSizeBracketFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrgSizeBracket[] | ListEnumOrgSizeBracketFieldRefInput<$PrismaModel>
    not?: NestedEnumOrgSizeBracketFilter<$PrismaModel> | $Enums.OrgSizeBracket
  }

  export type OnboardingResponseCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    email?: SortOrder
    clientFingerprint?: SortOrder
    intentTag?: SortOrder
    orgSizeBracket?: SortOrder
    tagVersionId?: SortOrder
    createdAt?: SortOrder
  }

  export type OnboardingResponseMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    email?: SortOrder
    clientFingerprint?: SortOrder
    intentTag?: SortOrder
    orgSizeBracket?: SortOrder
    tagVersionId?: SortOrder
    createdAt?: SortOrder
  }

  export type OnboardingResponseMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    email?: SortOrder
    clientFingerprint?: SortOrder
    intentTag?: SortOrder
    orgSizeBracket?: SortOrder
    tagVersionId?: SortOrder
    createdAt?: SortOrder
  }

  export type EnumIntentTagWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.IntentTag | EnumIntentTagFieldRefInput<$PrismaModel>
    in?: $Enums.IntentTag[] | ListEnumIntentTagFieldRefInput<$PrismaModel>
    notIn?: $Enums.IntentTag[] | ListEnumIntentTagFieldRefInput<$PrismaModel>
    not?: NestedEnumIntentTagWithAggregatesFilter<$PrismaModel> | $Enums.IntentTag
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumIntentTagFilter<$PrismaModel>
    _max?: NestedEnumIntentTagFilter<$PrismaModel>
  }

  export type EnumOrgSizeBracketWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OrgSizeBracket | EnumOrgSizeBracketFieldRefInput<$PrismaModel>
    in?: $Enums.OrgSizeBracket[] | ListEnumOrgSizeBracketFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrgSizeBracket[] | ListEnumOrgSizeBracketFieldRefInput<$PrismaModel>
    not?: NestedEnumOrgSizeBracketWithAggregatesFilter<$PrismaModel> | $Enums.OrgSizeBracket
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumOrgSizeBracketFilter<$PrismaModel>
    _max?: NestedEnumOrgSizeBracketFilter<$PrismaModel>
  }

  export type OnboardingResponseScalarRelationFilter = {
    is?: OnboardingResponseWhereInput
    isNot?: OnboardingResponseWhereInput
  }

  export type OnboardingOptionNullableScalarRelationFilter = {
    is?: OnboardingOptionWhereInput | null
    isNot?: OnboardingOptionWhereInput | null
  }

  export type OnboardingAnswerCountOrderByAggregateInput = {
    id?: SortOrder
    responseId?: SortOrder
    questionId?: SortOrder
    optionId?: SortOrder
    customValue?: SortOrder
  }

  export type OnboardingAnswerMaxOrderByAggregateInput = {
    id?: SortOrder
    responseId?: SortOrder
    questionId?: SortOrder
    optionId?: SortOrder
    customValue?: SortOrder
  }

  export type OnboardingAnswerMinOrderByAggregateInput = {
    id?: SortOrder
    responseId?: SortOrder
    questionId?: SortOrder
    optionId?: SortOrder
    customValue?: SortOrder
  }

  export type BlogPostCreateNestedManyWithoutAuthorInput = {
    create?: XOR<BlogPostCreateWithoutAuthorInput, BlogPostUncheckedCreateWithoutAuthorInput> | BlogPostCreateWithoutAuthorInput[] | BlogPostUncheckedCreateWithoutAuthorInput[]
    connectOrCreate?: BlogPostCreateOrConnectWithoutAuthorInput | BlogPostCreateOrConnectWithoutAuthorInput[]
    createMany?: BlogPostCreateManyAuthorInputEnvelope
    connect?: BlogPostWhereUniqueInput | BlogPostWhereUniqueInput[]
  }

  export type BlogPostUncheckedCreateNestedManyWithoutAuthorInput = {
    create?: XOR<BlogPostCreateWithoutAuthorInput, BlogPostUncheckedCreateWithoutAuthorInput> | BlogPostCreateWithoutAuthorInput[] | BlogPostUncheckedCreateWithoutAuthorInput[]
    connectOrCreate?: BlogPostCreateOrConnectWithoutAuthorInput | BlogPostCreateOrConnectWithoutAuthorInput[]
    createMany?: BlogPostCreateManyAuthorInputEnvelope
    connect?: BlogPostWhereUniqueInput | BlogPostWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type BlogPostUpdateManyWithoutAuthorNestedInput = {
    create?: XOR<BlogPostCreateWithoutAuthorInput, BlogPostUncheckedCreateWithoutAuthorInput> | BlogPostCreateWithoutAuthorInput[] | BlogPostUncheckedCreateWithoutAuthorInput[]
    connectOrCreate?: BlogPostCreateOrConnectWithoutAuthorInput | BlogPostCreateOrConnectWithoutAuthorInput[]
    upsert?: BlogPostUpsertWithWhereUniqueWithoutAuthorInput | BlogPostUpsertWithWhereUniqueWithoutAuthorInput[]
    createMany?: BlogPostCreateManyAuthorInputEnvelope
    set?: BlogPostWhereUniqueInput | BlogPostWhereUniqueInput[]
    disconnect?: BlogPostWhereUniqueInput | BlogPostWhereUniqueInput[]
    delete?: BlogPostWhereUniqueInput | BlogPostWhereUniqueInput[]
    connect?: BlogPostWhereUniqueInput | BlogPostWhereUniqueInput[]
    update?: BlogPostUpdateWithWhereUniqueWithoutAuthorInput | BlogPostUpdateWithWhereUniqueWithoutAuthorInput[]
    updateMany?: BlogPostUpdateManyWithWhereWithoutAuthorInput | BlogPostUpdateManyWithWhereWithoutAuthorInput[]
    deleteMany?: BlogPostScalarWhereInput | BlogPostScalarWhereInput[]
  }

  export type BlogPostUncheckedUpdateManyWithoutAuthorNestedInput = {
    create?: XOR<BlogPostCreateWithoutAuthorInput, BlogPostUncheckedCreateWithoutAuthorInput> | BlogPostCreateWithoutAuthorInput[] | BlogPostUncheckedCreateWithoutAuthorInput[]
    connectOrCreate?: BlogPostCreateOrConnectWithoutAuthorInput | BlogPostCreateOrConnectWithoutAuthorInput[]
    upsert?: BlogPostUpsertWithWhereUniqueWithoutAuthorInput | BlogPostUpsertWithWhereUniqueWithoutAuthorInput[]
    createMany?: BlogPostCreateManyAuthorInputEnvelope
    set?: BlogPostWhereUniqueInput | BlogPostWhereUniqueInput[]
    disconnect?: BlogPostWhereUniqueInput | BlogPostWhereUniqueInput[]
    delete?: BlogPostWhereUniqueInput | BlogPostWhereUniqueInput[]
    connect?: BlogPostWhereUniqueInput | BlogPostWhereUniqueInput[]
    update?: BlogPostUpdateWithWhereUniqueWithoutAuthorInput | BlogPostUpdateWithWhereUniqueWithoutAuthorInput[]
    updateMany?: BlogPostUpdateManyWithWhereWithoutAuthorInput | BlogPostUpdateManyWithWhereWithoutAuthorInput[]
    deleteMany?: BlogPostScalarWhereInput | BlogPostScalarWhereInput[]
  }

  export type BlogTagCreateNestedManyWithoutPostsInput = {
    create?: XOR<BlogTagCreateWithoutPostsInput, BlogTagUncheckedCreateWithoutPostsInput> | BlogTagCreateWithoutPostsInput[] | BlogTagUncheckedCreateWithoutPostsInput[]
    connectOrCreate?: BlogTagCreateOrConnectWithoutPostsInput | BlogTagCreateOrConnectWithoutPostsInput[]
    connect?: BlogTagWhereUniqueInput | BlogTagWhereUniqueInput[]
  }

  export type AdminAccountCreateNestedOneWithoutBlogPostInput = {
    create?: XOR<AdminAccountCreateWithoutBlogPostInput, AdminAccountUncheckedCreateWithoutBlogPostInput>
    connectOrCreate?: AdminAccountCreateOrConnectWithoutBlogPostInput
    connect?: AdminAccountWhereUniqueInput
  }

  export type BlogSeoCreateNestedOneWithoutBlogPostInput = {
    create?: XOR<BlogSeoCreateWithoutBlogPostInput, BlogSeoUncheckedCreateWithoutBlogPostInput>
    connectOrCreate?: BlogSeoCreateOrConnectWithoutBlogPostInput
    connect?: BlogSeoWhereUniqueInput
  }

  export type BlogTagUncheckedCreateNestedManyWithoutPostsInput = {
    create?: XOR<BlogTagCreateWithoutPostsInput, BlogTagUncheckedCreateWithoutPostsInput> | BlogTagCreateWithoutPostsInput[] | BlogTagUncheckedCreateWithoutPostsInput[]
    connectOrCreate?: BlogTagCreateOrConnectWithoutPostsInput | BlogTagCreateOrConnectWithoutPostsInput[]
    connect?: BlogTagWhereUniqueInput | BlogTagWhereUniqueInput[]
  }

  export type BlogSeoUncheckedCreateNestedOneWithoutBlogPostInput = {
    create?: XOR<BlogSeoCreateWithoutBlogPostInput, BlogSeoUncheckedCreateWithoutBlogPostInput>
    connectOrCreate?: BlogSeoCreateOrConnectWithoutBlogPostInput
    connect?: BlogSeoWhereUniqueInput
  }

  export type EnumBlogPostTypeFieldUpdateOperationsInput = {
    set?: $Enums.BlogPostType
  }

  export type EnumBlogPostStatusFieldUpdateOperationsInput = {
    set?: $Enums.BlogPostStatus
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type BlogTagUpdateManyWithoutPostsNestedInput = {
    create?: XOR<BlogTagCreateWithoutPostsInput, BlogTagUncheckedCreateWithoutPostsInput> | BlogTagCreateWithoutPostsInput[] | BlogTagUncheckedCreateWithoutPostsInput[]
    connectOrCreate?: BlogTagCreateOrConnectWithoutPostsInput | BlogTagCreateOrConnectWithoutPostsInput[]
    upsert?: BlogTagUpsertWithWhereUniqueWithoutPostsInput | BlogTagUpsertWithWhereUniqueWithoutPostsInput[]
    set?: BlogTagWhereUniqueInput | BlogTagWhereUniqueInput[]
    disconnect?: BlogTagWhereUniqueInput | BlogTagWhereUniqueInput[]
    delete?: BlogTagWhereUniqueInput | BlogTagWhereUniqueInput[]
    connect?: BlogTagWhereUniqueInput | BlogTagWhereUniqueInput[]
    update?: BlogTagUpdateWithWhereUniqueWithoutPostsInput | BlogTagUpdateWithWhereUniqueWithoutPostsInput[]
    updateMany?: BlogTagUpdateManyWithWhereWithoutPostsInput | BlogTagUpdateManyWithWhereWithoutPostsInput[]
    deleteMany?: BlogTagScalarWhereInput | BlogTagScalarWhereInput[]
  }

  export type AdminAccountUpdateOneRequiredWithoutBlogPostNestedInput = {
    create?: XOR<AdminAccountCreateWithoutBlogPostInput, AdminAccountUncheckedCreateWithoutBlogPostInput>
    connectOrCreate?: AdminAccountCreateOrConnectWithoutBlogPostInput
    upsert?: AdminAccountUpsertWithoutBlogPostInput
    connect?: AdminAccountWhereUniqueInput
    update?: XOR<XOR<AdminAccountUpdateToOneWithWhereWithoutBlogPostInput, AdminAccountUpdateWithoutBlogPostInput>, AdminAccountUncheckedUpdateWithoutBlogPostInput>
  }

  export type BlogSeoUpdateOneWithoutBlogPostNestedInput = {
    create?: XOR<BlogSeoCreateWithoutBlogPostInput, BlogSeoUncheckedCreateWithoutBlogPostInput>
    connectOrCreate?: BlogSeoCreateOrConnectWithoutBlogPostInput
    upsert?: BlogSeoUpsertWithoutBlogPostInput
    disconnect?: BlogSeoWhereInput | boolean
    delete?: BlogSeoWhereInput | boolean
    connect?: BlogSeoWhereUniqueInput
    update?: XOR<XOR<BlogSeoUpdateToOneWithWhereWithoutBlogPostInput, BlogSeoUpdateWithoutBlogPostInput>, BlogSeoUncheckedUpdateWithoutBlogPostInput>
  }

  export type BlogTagUncheckedUpdateManyWithoutPostsNestedInput = {
    create?: XOR<BlogTagCreateWithoutPostsInput, BlogTagUncheckedCreateWithoutPostsInput> | BlogTagCreateWithoutPostsInput[] | BlogTagUncheckedCreateWithoutPostsInput[]
    connectOrCreate?: BlogTagCreateOrConnectWithoutPostsInput | BlogTagCreateOrConnectWithoutPostsInput[]
    upsert?: BlogTagUpsertWithWhereUniqueWithoutPostsInput | BlogTagUpsertWithWhereUniqueWithoutPostsInput[]
    set?: BlogTagWhereUniqueInput | BlogTagWhereUniqueInput[]
    disconnect?: BlogTagWhereUniqueInput | BlogTagWhereUniqueInput[]
    delete?: BlogTagWhereUniqueInput | BlogTagWhereUniqueInput[]
    connect?: BlogTagWhereUniqueInput | BlogTagWhereUniqueInput[]
    update?: BlogTagUpdateWithWhereUniqueWithoutPostsInput | BlogTagUpdateWithWhereUniqueWithoutPostsInput[]
    updateMany?: BlogTagUpdateManyWithWhereWithoutPostsInput | BlogTagUpdateManyWithWhereWithoutPostsInput[]
    deleteMany?: BlogTagScalarWhereInput | BlogTagScalarWhereInput[]
  }

  export type BlogSeoUncheckedUpdateOneWithoutBlogPostNestedInput = {
    create?: XOR<BlogSeoCreateWithoutBlogPostInput, BlogSeoUncheckedCreateWithoutBlogPostInput>
    connectOrCreate?: BlogSeoCreateOrConnectWithoutBlogPostInput
    upsert?: BlogSeoUpsertWithoutBlogPostInput
    disconnect?: BlogSeoWhereInput | boolean
    delete?: BlogSeoWhereInput | boolean
    connect?: BlogSeoWhereUniqueInput
    update?: XOR<XOR<BlogSeoUpdateToOneWithWhereWithoutBlogPostInput, BlogSeoUpdateWithoutBlogPostInput>, BlogSeoUncheckedUpdateWithoutBlogPostInput>
  }

  export type BlogPostCreateNestedManyWithoutTagsInput = {
    create?: XOR<BlogPostCreateWithoutTagsInput, BlogPostUncheckedCreateWithoutTagsInput> | BlogPostCreateWithoutTagsInput[] | BlogPostUncheckedCreateWithoutTagsInput[]
    connectOrCreate?: BlogPostCreateOrConnectWithoutTagsInput | BlogPostCreateOrConnectWithoutTagsInput[]
    connect?: BlogPostWhereUniqueInput | BlogPostWhereUniqueInput[]
  }

  export type BlogPostUncheckedCreateNestedManyWithoutTagsInput = {
    create?: XOR<BlogPostCreateWithoutTagsInput, BlogPostUncheckedCreateWithoutTagsInput> | BlogPostCreateWithoutTagsInput[] | BlogPostUncheckedCreateWithoutTagsInput[]
    connectOrCreate?: BlogPostCreateOrConnectWithoutTagsInput | BlogPostCreateOrConnectWithoutTagsInput[]
    connect?: BlogPostWhereUniqueInput | BlogPostWhereUniqueInput[]
  }

  export type BlogPostUpdateManyWithoutTagsNestedInput = {
    create?: XOR<BlogPostCreateWithoutTagsInput, BlogPostUncheckedCreateWithoutTagsInput> | BlogPostCreateWithoutTagsInput[] | BlogPostUncheckedCreateWithoutTagsInput[]
    connectOrCreate?: BlogPostCreateOrConnectWithoutTagsInput | BlogPostCreateOrConnectWithoutTagsInput[]
    upsert?: BlogPostUpsertWithWhereUniqueWithoutTagsInput | BlogPostUpsertWithWhereUniqueWithoutTagsInput[]
    set?: BlogPostWhereUniqueInput | BlogPostWhereUniqueInput[]
    disconnect?: BlogPostWhereUniqueInput | BlogPostWhereUniqueInput[]
    delete?: BlogPostWhereUniqueInput | BlogPostWhereUniqueInput[]
    connect?: BlogPostWhereUniqueInput | BlogPostWhereUniqueInput[]
    update?: BlogPostUpdateWithWhereUniqueWithoutTagsInput | BlogPostUpdateWithWhereUniqueWithoutTagsInput[]
    updateMany?: BlogPostUpdateManyWithWhereWithoutTagsInput | BlogPostUpdateManyWithWhereWithoutTagsInput[]
    deleteMany?: BlogPostScalarWhereInput | BlogPostScalarWhereInput[]
  }

  export type BlogPostUncheckedUpdateManyWithoutTagsNestedInput = {
    create?: XOR<BlogPostCreateWithoutTagsInput, BlogPostUncheckedCreateWithoutTagsInput> | BlogPostCreateWithoutTagsInput[] | BlogPostUncheckedCreateWithoutTagsInput[]
    connectOrCreate?: BlogPostCreateOrConnectWithoutTagsInput | BlogPostCreateOrConnectWithoutTagsInput[]
    upsert?: BlogPostUpsertWithWhereUniqueWithoutTagsInput | BlogPostUpsertWithWhereUniqueWithoutTagsInput[]
    set?: BlogPostWhereUniqueInput | BlogPostWhereUniqueInput[]
    disconnect?: BlogPostWhereUniqueInput | BlogPostWhereUniqueInput[]
    delete?: BlogPostWhereUniqueInput | BlogPostWhereUniqueInput[]
    connect?: BlogPostWhereUniqueInput | BlogPostWhereUniqueInput[]
    update?: BlogPostUpdateWithWhereUniqueWithoutTagsInput | BlogPostUpdateWithWhereUniqueWithoutTagsInput[]
    updateMany?: BlogPostUpdateManyWithWhereWithoutTagsInput | BlogPostUpdateManyWithWhereWithoutTagsInput[]
    deleteMany?: BlogPostScalarWhereInput | BlogPostScalarWhereInput[]
  }

  export type BlogPostCreateNestedOneWithoutSeoInput = {
    create?: XOR<BlogPostCreateWithoutSeoInput, BlogPostUncheckedCreateWithoutSeoInput>
    connectOrCreate?: BlogPostCreateOrConnectWithoutSeoInput
    connect?: BlogPostWhereUniqueInput
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type BlogPostUpdateOneRequiredWithoutSeoNestedInput = {
    create?: XOR<BlogPostCreateWithoutSeoInput, BlogPostUncheckedCreateWithoutSeoInput>
    connectOrCreate?: BlogPostCreateOrConnectWithoutSeoInput
    upsert?: BlogPostUpsertWithoutSeoInput
    connect?: BlogPostWhereUniqueInput
    update?: XOR<XOR<BlogPostUpdateToOneWithWhereWithoutSeoInput, BlogPostUpdateWithoutSeoInput>, BlogPostUncheckedUpdateWithoutSeoInput>
  }

  export type OnboardingQuestionCreateNestedManyWithoutVersionInput = {
    create?: XOR<OnboardingQuestionCreateWithoutVersionInput, OnboardingQuestionUncheckedCreateWithoutVersionInput> | OnboardingQuestionCreateWithoutVersionInput[] | OnboardingQuestionUncheckedCreateWithoutVersionInput[]
    connectOrCreate?: OnboardingQuestionCreateOrConnectWithoutVersionInput | OnboardingQuestionCreateOrConnectWithoutVersionInput[]
    createMany?: OnboardingQuestionCreateManyVersionInputEnvelope
    connect?: OnboardingQuestionWhereUniqueInput | OnboardingQuestionWhereUniqueInput[]
  }

  export type OnboardingResponseCreateNestedManyWithoutTagVersionInput = {
    create?: XOR<OnboardingResponseCreateWithoutTagVersionInput, OnboardingResponseUncheckedCreateWithoutTagVersionInput> | OnboardingResponseCreateWithoutTagVersionInput[] | OnboardingResponseUncheckedCreateWithoutTagVersionInput[]
    connectOrCreate?: OnboardingResponseCreateOrConnectWithoutTagVersionInput | OnboardingResponseCreateOrConnectWithoutTagVersionInput[]
    createMany?: OnboardingResponseCreateManyTagVersionInputEnvelope
    connect?: OnboardingResponseWhereUniqueInput | OnboardingResponseWhereUniqueInput[]
  }

  export type OnboardingQuestionUncheckedCreateNestedManyWithoutVersionInput = {
    create?: XOR<OnboardingQuestionCreateWithoutVersionInput, OnboardingQuestionUncheckedCreateWithoutVersionInput> | OnboardingQuestionCreateWithoutVersionInput[] | OnboardingQuestionUncheckedCreateWithoutVersionInput[]
    connectOrCreate?: OnboardingQuestionCreateOrConnectWithoutVersionInput | OnboardingQuestionCreateOrConnectWithoutVersionInput[]
    createMany?: OnboardingQuestionCreateManyVersionInputEnvelope
    connect?: OnboardingQuestionWhereUniqueInput | OnboardingQuestionWhereUniqueInput[]
  }

  export type OnboardingResponseUncheckedCreateNestedManyWithoutTagVersionInput = {
    create?: XOR<OnboardingResponseCreateWithoutTagVersionInput, OnboardingResponseUncheckedCreateWithoutTagVersionInput> | OnboardingResponseCreateWithoutTagVersionInput[] | OnboardingResponseUncheckedCreateWithoutTagVersionInput[]
    connectOrCreate?: OnboardingResponseCreateOrConnectWithoutTagVersionInput | OnboardingResponseCreateOrConnectWithoutTagVersionInput[]
    createMany?: OnboardingResponseCreateManyTagVersionInputEnvelope
    connect?: OnboardingResponseWhereUniqueInput | OnboardingResponseWhereUniqueInput[]
  }

  export type EnumTagStatusFieldUpdateOperationsInput = {
    set?: $Enums.TagStatus
  }

  export type OnboardingQuestionUpdateManyWithoutVersionNestedInput = {
    create?: XOR<OnboardingQuestionCreateWithoutVersionInput, OnboardingQuestionUncheckedCreateWithoutVersionInput> | OnboardingQuestionCreateWithoutVersionInput[] | OnboardingQuestionUncheckedCreateWithoutVersionInput[]
    connectOrCreate?: OnboardingQuestionCreateOrConnectWithoutVersionInput | OnboardingQuestionCreateOrConnectWithoutVersionInput[]
    upsert?: OnboardingQuestionUpsertWithWhereUniqueWithoutVersionInput | OnboardingQuestionUpsertWithWhereUniqueWithoutVersionInput[]
    createMany?: OnboardingQuestionCreateManyVersionInputEnvelope
    set?: OnboardingQuestionWhereUniqueInput | OnboardingQuestionWhereUniqueInput[]
    disconnect?: OnboardingQuestionWhereUniqueInput | OnboardingQuestionWhereUniqueInput[]
    delete?: OnboardingQuestionWhereUniqueInput | OnboardingQuestionWhereUniqueInput[]
    connect?: OnboardingQuestionWhereUniqueInput | OnboardingQuestionWhereUniqueInput[]
    update?: OnboardingQuestionUpdateWithWhereUniqueWithoutVersionInput | OnboardingQuestionUpdateWithWhereUniqueWithoutVersionInput[]
    updateMany?: OnboardingQuestionUpdateManyWithWhereWithoutVersionInput | OnboardingQuestionUpdateManyWithWhereWithoutVersionInput[]
    deleteMany?: OnboardingQuestionScalarWhereInput | OnboardingQuestionScalarWhereInput[]
  }

  export type OnboardingResponseUpdateManyWithoutTagVersionNestedInput = {
    create?: XOR<OnboardingResponseCreateWithoutTagVersionInput, OnboardingResponseUncheckedCreateWithoutTagVersionInput> | OnboardingResponseCreateWithoutTagVersionInput[] | OnboardingResponseUncheckedCreateWithoutTagVersionInput[]
    connectOrCreate?: OnboardingResponseCreateOrConnectWithoutTagVersionInput | OnboardingResponseCreateOrConnectWithoutTagVersionInput[]
    upsert?: OnboardingResponseUpsertWithWhereUniqueWithoutTagVersionInput | OnboardingResponseUpsertWithWhereUniqueWithoutTagVersionInput[]
    createMany?: OnboardingResponseCreateManyTagVersionInputEnvelope
    set?: OnboardingResponseWhereUniqueInput | OnboardingResponseWhereUniqueInput[]
    disconnect?: OnboardingResponseWhereUniqueInput | OnboardingResponseWhereUniqueInput[]
    delete?: OnboardingResponseWhereUniqueInput | OnboardingResponseWhereUniqueInput[]
    connect?: OnboardingResponseWhereUniqueInput | OnboardingResponseWhereUniqueInput[]
    update?: OnboardingResponseUpdateWithWhereUniqueWithoutTagVersionInput | OnboardingResponseUpdateWithWhereUniqueWithoutTagVersionInput[]
    updateMany?: OnboardingResponseUpdateManyWithWhereWithoutTagVersionInput | OnboardingResponseUpdateManyWithWhereWithoutTagVersionInput[]
    deleteMany?: OnboardingResponseScalarWhereInput | OnboardingResponseScalarWhereInput[]
  }

  export type OnboardingQuestionUncheckedUpdateManyWithoutVersionNestedInput = {
    create?: XOR<OnboardingQuestionCreateWithoutVersionInput, OnboardingQuestionUncheckedCreateWithoutVersionInput> | OnboardingQuestionCreateWithoutVersionInput[] | OnboardingQuestionUncheckedCreateWithoutVersionInput[]
    connectOrCreate?: OnboardingQuestionCreateOrConnectWithoutVersionInput | OnboardingQuestionCreateOrConnectWithoutVersionInput[]
    upsert?: OnboardingQuestionUpsertWithWhereUniqueWithoutVersionInput | OnboardingQuestionUpsertWithWhereUniqueWithoutVersionInput[]
    createMany?: OnboardingQuestionCreateManyVersionInputEnvelope
    set?: OnboardingQuestionWhereUniqueInput | OnboardingQuestionWhereUniqueInput[]
    disconnect?: OnboardingQuestionWhereUniqueInput | OnboardingQuestionWhereUniqueInput[]
    delete?: OnboardingQuestionWhereUniqueInput | OnboardingQuestionWhereUniqueInput[]
    connect?: OnboardingQuestionWhereUniqueInput | OnboardingQuestionWhereUniqueInput[]
    update?: OnboardingQuestionUpdateWithWhereUniqueWithoutVersionInput | OnboardingQuestionUpdateWithWhereUniqueWithoutVersionInput[]
    updateMany?: OnboardingQuestionUpdateManyWithWhereWithoutVersionInput | OnboardingQuestionUpdateManyWithWhereWithoutVersionInput[]
    deleteMany?: OnboardingQuestionScalarWhereInput | OnboardingQuestionScalarWhereInput[]
  }

  export type OnboardingResponseUncheckedUpdateManyWithoutTagVersionNestedInput = {
    create?: XOR<OnboardingResponseCreateWithoutTagVersionInput, OnboardingResponseUncheckedCreateWithoutTagVersionInput> | OnboardingResponseCreateWithoutTagVersionInput[] | OnboardingResponseUncheckedCreateWithoutTagVersionInput[]
    connectOrCreate?: OnboardingResponseCreateOrConnectWithoutTagVersionInput | OnboardingResponseCreateOrConnectWithoutTagVersionInput[]
    upsert?: OnboardingResponseUpsertWithWhereUniqueWithoutTagVersionInput | OnboardingResponseUpsertWithWhereUniqueWithoutTagVersionInput[]
    createMany?: OnboardingResponseCreateManyTagVersionInputEnvelope
    set?: OnboardingResponseWhereUniqueInput | OnboardingResponseWhereUniqueInput[]
    disconnect?: OnboardingResponseWhereUniqueInput | OnboardingResponseWhereUniqueInput[]
    delete?: OnboardingResponseWhereUniqueInput | OnboardingResponseWhereUniqueInput[]
    connect?: OnboardingResponseWhereUniqueInput | OnboardingResponseWhereUniqueInput[]
    update?: OnboardingResponseUpdateWithWhereUniqueWithoutTagVersionInput | OnboardingResponseUpdateWithWhereUniqueWithoutTagVersionInput[]
    updateMany?: OnboardingResponseUpdateManyWithWhereWithoutTagVersionInput | OnboardingResponseUpdateManyWithWhereWithoutTagVersionInput[]
    deleteMany?: OnboardingResponseScalarWhereInput | OnboardingResponseScalarWhereInput[]
  }

  export type OnboardingTagVersionCreateNestedOneWithoutQuestionsInput = {
    create?: XOR<OnboardingTagVersionCreateWithoutQuestionsInput, OnboardingTagVersionUncheckedCreateWithoutQuestionsInput>
    connectOrCreate?: OnboardingTagVersionCreateOrConnectWithoutQuestionsInput
    connect?: OnboardingTagVersionWhereUniqueInput
  }

  export type OnboardingOptionCreateNestedManyWithoutQuestionInput = {
    create?: XOR<OnboardingOptionCreateWithoutQuestionInput, OnboardingOptionUncheckedCreateWithoutQuestionInput> | OnboardingOptionCreateWithoutQuestionInput[] | OnboardingOptionUncheckedCreateWithoutQuestionInput[]
    connectOrCreate?: OnboardingOptionCreateOrConnectWithoutQuestionInput | OnboardingOptionCreateOrConnectWithoutQuestionInput[]
    createMany?: OnboardingOptionCreateManyQuestionInputEnvelope
    connect?: OnboardingOptionWhereUniqueInput | OnboardingOptionWhereUniqueInput[]
  }

  export type OnboardingAnswerCreateNestedManyWithoutQuestionInput = {
    create?: XOR<OnboardingAnswerCreateWithoutQuestionInput, OnboardingAnswerUncheckedCreateWithoutQuestionInput> | OnboardingAnswerCreateWithoutQuestionInput[] | OnboardingAnswerUncheckedCreateWithoutQuestionInput[]
    connectOrCreate?: OnboardingAnswerCreateOrConnectWithoutQuestionInput | OnboardingAnswerCreateOrConnectWithoutQuestionInput[]
    createMany?: OnboardingAnswerCreateManyQuestionInputEnvelope
    connect?: OnboardingAnswerWhereUniqueInput | OnboardingAnswerWhereUniqueInput[]
  }

  export type OnboardingOptionUncheckedCreateNestedManyWithoutQuestionInput = {
    create?: XOR<OnboardingOptionCreateWithoutQuestionInput, OnboardingOptionUncheckedCreateWithoutQuestionInput> | OnboardingOptionCreateWithoutQuestionInput[] | OnboardingOptionUncheckedCreateWithoutQuestionInput[]
    connectOrCreate?: OnboardingOptionCreateOrConnectWithoutQuestionInput | OnboardingOptionCreateOrConnectWithoutQuestionInput[]
    createMany?: OnboardingOptionCreateManyQuestionInputEnvelope
    connect?: OnboardingOptionWhereUniqueInput | OnboardingOptionWhereUniqueInput[]
  }

  export type OnboardingAnswerUncheckedCreateNestedManyWithoutQuestionInput = {
    create?: XOR<OnboardingAnswerCreateWithoutQuestionInput, OnboardingAnswerUncheckedCreateWithoutQuestionInput> | OnboardingAnswerCreateWithoutQuestionInput[] | OnboardingAnswerUncheckedCreateWithoutQuestionInput[]
    connectOrCreate?: OnboardingAnswerCreateOrConnectWithoutQuestionInput | OnboardingAnswerCreateOrConnectWithoutQuestionInput[]
    createMany?: OnboardingAnswerCreateManyQuestionInputEnvelope
    connect?: OnboardingAnswerWhereUniqueInput | OnboardingAnswerWhereUniqueInput[]
  }

  export type EnumQuestionTypeFieldUpdateOperationsInput = {
    set?: $Enums.QuestionType
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type OnboardingTagVersionUpdateOneRequiredWithoutQuestionsNestedInput = {
    create?: XOR<OnboardingTagVersionCreateWithoutQuestionsInput, OnboardingTagVersionUncheckedCreateWithoutQuestionsInput>
    connectOrCreate?: OnboardingTagVersionCreateOrConnectWithoutQuestionsInput
    upsert?: OnboardingTagVersionUpsertWithoutQuestionsInput
    connect?: OnboardingTagVersionWhereUniqueInput
    update?: XOR<XOR<OnboardingTagVersionUpdateToOneWithWhereWithoutQuestionsInput, OnboardingTagVersionUpdateWithoutQuestionsInput>, OnboardingTagVersionUncheckedUpdateWithoutQuestionsInput>
  }

  export type OnboardingOptionUpdateManyWithoutQuestionNestedInput = {
    create?: XOR<OnboardingOptionCreateWithoutQuestionInput, OnboardingOptionUncheckedCreateWithoutQuestionInput> | OnboardingOptionCreateWithoutQuestionInput[] | OnboardingOptionUncheckedCreateWithoutQuestionInput[]
    connectOrCreate?: OnboardingOptionCreateOrConnectWithoutQuestionInput | OnboardingOptionCreateOrConnectWithoutQuestionInput[]
    upsert?: OnboardingOptionUpsertWithWhereUniqueWithoutQuestionInput | OnboardingOptionUpsertWithWhereUniqueWithoutQuestionInput[]
    createMany?: OnboardingOptionCreateManyQuestionInputEnvelope
    set?: OnboardingOptionWhereUniqueInput | OnboardingOptionWhereUniqueInput[]
    disconnect?: OnboardingOptionWhereUniqueInput | OnboardingOptionWhereUniqueInput[]
    delete?: OnboardingOptionWhereUniqueInput | OnboardingOptionWhereUniqueInput[]
    connect?: OnboardingOptionWhereUniqueInput | OnboardingOptionWhereUniqueInput[]
    update?: OnboardingOptionUpdateWithWhereUniqueWithoutQuestionInput | OnboardingOptionUpdateWithWhereUniqueWithoutQuestionInput[]
    updateMany?: OnboardingOptionUpdateManyWithWhereWithoutQuestionInput | OnboardingOptionUpdateManyWithWhereWithoutQuestionInput[]
    deleteMany?: OnboardingOptionScalarWhereInput | OnboardingOptionScalarWhereInput[]
  }

  export type OnboardingAnswerUpdateManyWithoutQuestionNestedInput = {
    create?: XOR<OnboardingAnswerCreateWithoutQuestionInput, OnboardingAnswerUncheckedCreateWithoutQuestionInput> | OnboardingAnswerCreateWithoutQuestionInput[] | OnboardingAnswerUncheckedCreateWithoutQuestionInput[]
    connectOrCreate?: OnboardingAnswerCreateOrConnectWithoutQuestionInput | OnboardingAnswerCreateOrConnectWithoutQuestionInput[]
    upsert?: OnboardingAnswerUpsertWithWhereUniqueWithoutQuestionInput | OnboardingAnswerUpsertWithWhereUniqueWithoutQuestionInput[]
    createMany?: OnboardingAnswerCreateManyQuestionInputEnvelope
    set?: OnboardingAnswerWhereUniqueInput | OnboardingAnswerWhereUniqueInput[]
    disconnect?: OnboardingAnswerWhereUniqueInput | OnboardingAnswerWhereUniqueInput[]
    delete?: OnboardingAnswerWhereUniqueInput | OnboardingAnswerWhereUniqueInput[]
    connect?: OnboardingAnswerWhereUniqueInput | OnboardingAnswerWhereUniqueInput[]
    update?: OnboardingAnswerUpdateWithWhereUniqueWithoutQuestionInput | OnboardingAnswerUpdateWithWhereUniqueWithoutQuestionInput[]
    updateMany?: OnboardingAnswerUpdateManyWithWhereWithoutQuestionInput | OnboardingAnswerUpdateManyWithWhereWithoutQuestionInput[]
    deleteMany?: OnboardingAnswerScalarWhereInput | OnboardingAnswerScalarWhereInput[]
  }

  export type OnboardingOptionUncheckedUpdateManyWithoutQuestionNestedInput = {
    create?: XOR<OnboardingOptionCreateWithoutQuestionInput, OnboardingOptionUncheckedCreateWithoutQuestionInput> | OnboardingOptionCreateWithoutQuestionInput[] | OnboardingOptionUncheckedCreateWithoutQuestionInput[]
    connectOrCreate?: OnboardingOptionCreateOrConnectWithoutQuestionInput | OnboardingOptionCreateOrConnectWithoutQuestionInput[]
    upsert?: OnboardingOptionUpsertWithWhereUniqueWithoutQuestionInput | OnboardingOptionUpsertWithWhereUniqueWithoutQuestionInput[]
    createMany?: OnboardingOptionCreateManyQuestionInputEnvelope
    set?: OnboardingOptionWhereUniqueInput | OnboardingOptionWhereUniqueInput[]
    disconnect?: OnboardingOptionWhereUniqueInput | OnboardingOptionWhereUniqueInput[]
    delete?: OnboardingOptionWhereUniqueInput | OnboardingOptionWhereUniqueInput[]
    connect?: OnboardingOptionWhereUniqueInput | OnboardingOptionWhereUniqueInput[]
    update?: OnboardingOptionUpdateWithWhereUniqueWithoutQuestionInput | OnboardingOptionUpdateWithWhereUniqueWithoutQuestionInput[]
    updateMany?: OnboardingOptionUpdateManyWithWhereWithoutQuestionInput | OnboardingOptionUpdateManyWithWhereWithoutQuestionInput[]
    deleteMany?: OnboardingOptionScalarWhereInput | OnboardingOptionScalarWhereInput[]
  }

  export type OnboardingAnswerUncheckedUpdateManyWithoutQuestionNestedInput = {
    create?: XOR<OnboardingAnswerCreateWithoutQuestionInput, OnboardingAnswerUncheckedCreateWithoutQuestionInput> | OnboardingAnswerCreateWithoutQuestionInput[] | OnboardingAnswerUncheckedCreateWithoutQuestionInput[]
    connectOrCreate?: OnboardingAnswerCreateOrConnectWithoutQuestionInput | OnboardingAnswerCreateOrConnectWithoutQuestionInput[]
    upsert?: OnboardingAnswerUpsertWithWhereUniqueWithoutQuestionInput | OnboardingAnswerUpsertWithWhereUniqueWithoutQuestionInput[]
    createMany?: OnboardingAnswerCreateManyQuestionInputEnvelope
    set?: OnboardingAnswerWhereUniqueInput | OnboardingAnswerWhereUniqueInput[]
    disconnect?: OnboardingAnswerWhereUniqueInput | OnboardingAnswerWhereUniqueInput[]
    delete?: OnboardingAnswerWhereUniqueInput | OnboardingAnswerWhereUniqueInput[]
    connect?: OnboardingAnswerWhereUniqueInput | OnboardingAnswerWhereUniqueInput[]
    update?: OnboardingAnswerUpdateWithWhereUniqueWithoutQuestionInput | OnboardingAnswerUpdateWithWhereUniqueWithoutQuestionInput[]
    updateMany?: OnboardingAnswerUpdateManyWithWhereWithoutQuestionInput | OnboardingAnswerUpdateManyWithWhereWithoutQuestionInput[]
    deleteMany?: OnboardingAnswerScalarWhereInput | OnboardingAnswerScalarWhereInput[]
  }

  export type OnboardingQuestionCreateNestedOneWithoutOptionsInput = {
    create?: XOR<OnboardingQuestionCreateWithoutOptionsInput, OnboardingQuestionUncheckedCreateWithoutOptionsInput>
    connectOrCreate?: OnboardingQuestionCreateOrConnectWithoutOptionsInput
    connect?: OnboardingQuestionWhereUniqueInput
  }

  export type OnboardingAnswerCreateNestedManyWithoutOptionInput = {
    create?: XOR<OnboardingAnswerCreateWithoutOptionInput, OnboardingAnswerUncheckedCreateWithoutOptionInput> | OnboardingAnswerCreateWithoutOptionInput[] | OnboardingAnswerUncheckedCreateWithoutOptionInput[]
    connectOrCreate?: OnboardingAnswerCreateOrConnectWithoutOptionInput | OnboardingAnswerCreateOrConnectWithoutOptionInput[]
    createMany?: OnboardingAnswerCreateManyOptionInputEnvelope
    connect?: OnboardingAnswerWhereUniqueInput | OnboardingAnswerWhereUniqueInput[]
  }

  export type OnboardingAnswerUncheckedCreateNestedManyWithoutOptionInput = {
    create?: XOR<OnboardingAnswerCreateWithoutOptionInput, OnboardingAnswerUncheckedCreateWithoutOptionInput> | OnboardingAnswerCreateWithoutOptionInput[] | OnboardingAnswerUncheckedCreateWithoutOptionInput[]
    connectOrCreate?: OnboardingAnswerCreateOrConnectWithoutOptionInput | OnboardingAnswerCreateOrConnectWithoutOptionInput[]
    createMany?: OnboardingAnswerCreateManyOptionInputEnvelope
    connect?: OnboardingAnswerWhereUniqueInput | OnboardingAnswerWhereUniqueInput[]
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type OnboardingQuestionUpdateOneRequiredWithoutOptionsNestedInput = {
    create?: XOR<OnboardingQuestionCreateWithoutOptionsInput, OnboardingQuestionUncheckedCreateWithoutOptionsInput>
    connectOrCreate?: OnboardingQuestionCreateOrConnectWithoutOptionsInput
    upsert?: OnboardingQuestionUpsertWithoutOptionsInput
    connect?: OnboardingQuestionWhereUniqueInput
    update?: XOR<XOR<OnboardingQuestionUpdateToOneWithWhereWithoutOptionsInput, OnboardingQuestionUpdateWithoutOptionsInput>, OnboardingQuestionUncheckedUpdateWithoutOptionsInput>
  }

  export type OnboardingAnswerUpdateManyWithoutOptionNestedInput = {
    create?: XOR<OnboardingAnswerCreateWithoutOptionInput, OnboardingAnswerUncheckedCreateWithoutOptionInput> | OnboardingAnswerCreateWithoutOptionInput[] | OnboardingAnswerUncheckedCreateWithoutOptionInput[]
    connectOrCreate?: OnboardingAnswerCreateOrConnectWithoutOptionInput | OnboardingAnswerCreateOrConnectWithoutOptionInput[]
    upsert?: OnboardingAnswerUpsertWithWhereUniqueWithoutOptionInput | OnboardingAnswerUpsertWithWhereUniqueWithoutOptionInput[]
    createMany?: OnboardingAnswerCreateManyOptionInputEnvelope
    set?: OnboardingAnswerWhereUniqueInput | OnboardingAnswerWhereUniqueInput[]
    disconnect?: OnboardingAnswerWhereUniqueInput | OnboardingAnswerWhereUniqueInput[]
    delete?: OnboardingAnswerWhereUniqueInput | OnboardingAnswerWhereUniqueInput[]
    connect?: OnboardingAnswerWhereUniqueInput | OnboardingAnswerWhereUniqueInput[]
    update?: OnboardingAnswerUpdateWithWhereUniqueWithoutOptionInput | OnboardingAnswerUpdateWithWhereUniqueWithoutOptionInput[]
    updateMany?: OnboardingAnswerUpdateManyWithWhereWithoutOptionInput | OnboardingAnswerUpdateManyWithWhereWithoutOptionInput[]
    deleteMany?: OnboardingAnswerScalarWhereInput | OnboardingAnswerScalarWhereInput[]
  }

  export type OnboardingAnswerUncheckedUpdateManyWithoutOptionNestedInput = {
    create?: XOR<OnboardingAnswerCreateWithoutOptionInput, OnboardingAnswerUncheckedCreateWithoutOptionInput> | OnboardingAnswerCreateWithoutOptionInput[] | OnboardingAnswerUncheckedCreateWithoutOptionInput[]
    connectOrCreate?: OnboardingAnswerCreateOrConnectWithoutOptionInput | OnboardingAnswerCreateOrConnectWithoutOptionInput[]
    upsert?: OnboardingAnswerUpsertWithWhereUniqueWithoutOptionInput | OnboardingAnswerUpsertWithWhereUniqueWithoutOptionInput[]
    createMany?: OnboardingAnswerCreateManyOptionInputEnvelope
    set?: OnboardingAnswerWhereUniqueInput | OnboardingAnswerWhereUniqueInput[]
    disconnect?: OnboardingAnswerWhereUniqueInput | OnboardingAnswerWhereUniqueInput[]
    delete?: OnboardingAnswerWhereUniqueInput | OnboardingAnswerWhereUniqueInput[]
    connect?: OnboardingAnswerWhereUniqueInput | OnboardingAnswerWhereUniqueInput[]
    update?: OnboardingAnswerUpdateWithWhereUniqueWithoutOptionInput | OnboardingAnswerUpdateWithWhereUniqueWithoutOptionInput[]
    updateMany?: OnboardingAnswerUpdateManyWithWhereWithoutOptionInput | OnboardingAnswerUpdateManyWithWhereWithoutOptionInput[]
    deleteMany?: OnboardingAnswerScalarWhereInput | OnboardingAnswerScalarWhereInput[]
  }

  export type OnboardingTagVersionCreateNestedOneWithoutResponsesInput = {
    create?: XOR<OnboardingTagVersionCreateWithoutResponsesInput, OnboardingTagVersionUncheckedCreateWithoutResponsesInput>
    connectOrCreate?: OnboardingTagVersionCreateOrConnectWithoutResponsesInput
    connect?: OnboardingTagVersionWhereUniqueInput
  }

  export type OnboardingAnswerCreateNestedManyWithoutResponseInput = {
    create?: XOR<OnboardingAnswerCreateWithoutResponseInput, OnboardingAnswerUncheckedCreateWithoutResponseInput> | OnboardingAnswerCreateWithoutResponseInput[] | OnboardingAnswerUncheckedCreateWithoutResponseInput[]
    connectOrCreate?: OnboardingAnswerCreateOrConnectWithoutResponseInput | OnboardingAnswerCreateOrConnectWithoutResponseInput[]
    createMany?: OnboardingAnswerCreateManyResponseInputEnvelope
    connect?: OnboardingAnswerWhereUniqueInput | OnboardingAnswerWhereUniqueInput[]
  }

  export type OnboardingAnswerUncheckedCreateNestedManyWithoutResponseInput = {
    create?: XOR<OnboardingAnswerCreateWithoutResponseInput, OnboardingAnswerUncheckedCreateWithoutResponseInput> | OnboardingAnswerCreateWithoutResponseInput[] | OnboardingAnswerUncheckedCreateWithoutResponseInput[]
    connectOrCreate?: OnboardingAnswerCreateOrConnectWithoutResponseInput | OnboardingAnswerCreateOrConnectWithoutResponseInput[]
    createMany?: OnboardingAnswerCreateManyResponseInputEnvelope
    connect?: OnboardingAnswerWhereUniqueInput | OnboardingAnswerWhereUniqueInput[]
  }

  export type EnumIntentTagFieldUpdateOperationsInput = {
    set?: $Enums.IntentTag
  }

  export type EnumOrgSizeBracketFieldUpdateOperationsInput = {
    set?: $Enums.OrgSizeBracket
  }

  export type OnboardingTagVersionUpdateOneRequiredWithoutResponsesNestedInput = {
    create?: XOR<OnboardingTagVersionCreateWithoutResponsesInput, OnboardingTagVersionUncheckedCreateWithoutResponsesInput>
    connectOrCreate?: OnboardingTagVersionCreateOrConnectWithoutResponsesInput
    upsert?: OnboardingTagVersionUpsertWithoutResponsesInput
    connect?: OnboardingTagVersionWhereUniqueInput
    update?: XOR<XOR<OnboardingTagVersionUpdateToOneWithWhereWithoutResponsesInput, OnboardingTagVersionUpdateWithoutResponsesInput>, OnboardingTagVersionUncheckedUpdateWithoutResponsesInput>
  }

  export type OnboardingAnswerUpdateManyWithoutResponseNestedInput = {
    create?: XOR<OnboardingAnswerCreateWithoutResponseInput, OnboardingAnswerUncheckedCreateWithoutResponseInput> | OnboardingAnswerCreateWithoutResponseInput[] | OnboardingAnswerUncheckedCreateWithoutResponseInput[]
    connectOrCreate?: OnboardingAnswerCreateOrConnectWithoutResponseInput | OnboardingAnswerCreateOrConnectWithoutResponseInput[]
    upsert?: OnboardingAnswerUpsertWithWhereUniqueWithoutResponseInput | OnboardingAnswerUpsertWithWhereUniqueWithoutResponseInput[]
    createMany?: OnboardingAnswerCreateManyResponseInputEnvelope
    set?: OnboardingAnswerWhereUniqueInput | OnboardingAnswerWhereUniqueInput[]
    disconnect?: OnboardingAnswerWhereUniqueInput | OnboardingAnswerWhereUniqueInput[]
    delete?: OnboardingAnswerWhereUniqueInput | OnboardingAnswerWhereUniqueInput[]
    connect?: OnboardingAnswerWhereUniqueInput | OnboardingAnswerWhereUniqueInput[]
    update?: OnboardingAnswerUpdateWithWhereUniqueWithoutResponseInput | OnboardingAnswerUpdateWithWhereUniqueWithoutResponseInput[]
    updateMany?: OnboardingAnswerUpdateManyWithWhereWithoutResponseInput | OnboardingAnswerUpdateManyWithWhereWithoutResponseInput[]
    deleteMany?: OnboardingAnswerScalarWhereInput | OnboardingAnswerScalarWhereInput[]
  }

  export type OnboardingAnswerUncheckedUpdateManyWithoutResponseNestedInput = {
    create?: XOR<OnboardingAnswerCreateWithoutResponseInput, OnboardingAnswerUncheckedCreateWithoutResponseInput> | OnboardingAnswerCreateWithoutResponseInput[] | OnboardingAnswerUncheckedCreateWithoutResponseInput[]
    connectOrCreate?: OnboardingAnswerCreateOrConnectWithoutResponseInput | OnboardingAnswerCreateOrConnectWithoutResponseInput[]
    upsert?: OnboardingAnswerUpsertWithWhereUniqueWithoutResponseInput | OnboardingAnswerUpsertWithWhereUniqueWithoutResponseInput[]
    createMany?: OnboardingAnswerCreateManyResponseInputEnvelope
    set?: OnboardingAnswerWhereUniqueInput | OnboardingAnswerWhereUniqueInput[]
    disconnect?: OnboardingAnswerWhereUniqueInput | OnboardingAnswerWhereUniqueInput[]
    delete?: OnboardingAnswerWhereUniqueInput | OnboardingAnswerWhereUniqueInput[]
    connect?: OnboardingAnswerWhereUniqueInput | OnboardingAnswerWhereUniqueInput[]
    update?: OnboardingAnswerUpdateWithWhereUniqueWithoutResponseInput | OnboardingAnswerUpdateWithWhereUniqueWithoutResponseInput[]
    updateMany?: OnboardingAnswerUpdateManyWithWhereWithoutResponseInput | OnboardingAnswerUpdateManyWithWhereWithoutResponseInput[]
    deleteMany?: OnboardingAnswerScalarWhereInput | OnboardingAnswerScalarWhereInput[]
  }

  export type OnboardingResponseCreateNestedOneWithoutAnswersInput = {
    create?: XOR<OnboardingResponseCreateWithoutAnswersInput, OnboardingResponseUncheckedCreateWithoutAnswersInput>
    connectOrCreate?: OnboardingResponseCreateOrConnectWithoutAnswersInput
    connect?: OnboardingResponseWhereUniqueInput
  }

  export type OnboardingQuestionCreateNestedOneWithoutAnswersInput = {
    create?: XOR<OnboardingQuestionCreateWithoutAnswersInput, OnboardingQuestionUncheckedCreateWithoutAnswersInput>
    connectOrCreate?: OnboardingQuestionCreateOrConnectWithoutAnswersInput
    connect?: OnboardingQuestionWhereUniqueInput
  }

  export type OnboardingOptionCreateNestedOneWithoutAnswersInput = {
    create?: XOR<OnboardingOptionCreateWithoutAnswersInput, OnboardingOptionUncheckedCreateWithoutAnswersInput>
    connectOrCreate?: OnboardingOptionCreateOrConnectWithoutAnswersInput
    connect?: OnboardingOptionWhereUniqueInput
  }

  export type OnboardingResponseUpdateOneRequiredWithoutAnswersNestedInput = {
    create?: XOR<OnboardingResponseCreateWithoutAnswersInput, OnboardingResponseUncheckedCreateWithoutAnswersInput>
    connectOrCreate?: OnboardingResponseCreateOrConnectWithoutAnswersInput
    upsert?: OnboardingResponseUpsertWithoutAnswersInput
    connect?: OnboardingResponseWhereUniqueInput
    update?: XOR<XOR<OnboardingResponseUpdateToOneWithWhereWithoutAnswersInput, OnboardingResponseUpdateWithoutAnswersInput>, OnboardingResponseUncheckedUpdateWithoutAnswersInput>
  }

  export type OnboardingQuestionUpdateOneRequiredWithoutAnswersNestedInput = {
    create?: XOR<OnboardingQuestionCreateWithoutAnswersInput, OnboardingQuestionUncheckedCreateWithoutAnswersInput>
    connectOrCreate?: OnboardingQuestionCreateOrConnectWithoutAnswersInput
    upsert?: OnboardingQuestionUpsertWithoutAnswersInput
    connect?: OnboardingQuestionWhereUniqueInput
    update?: XOR<XOR<OnboardingQuestionUpdateToOneWithWhereWithoutAnswersInput, OnboardingQuestionUpdateWithoutAnswersInput>, OnboardingQuestionUncheckedUpdateWithoutAnswersInput>
  }

  export type OnboardingOptionUpdateOneWithoutAnswersNestedInput = {
    create?: XOR<OnboardingOptionCreateWithoutAnswersInput, OnboardingOptionUncheckedCreateWithoutAnswersInput>
    connectOrCreate?: OnboardingOptionCreateOrConnectWithoutAnswersInput
    upsert?: OnboardingOptionUpsertWithoutAnswersInput
    disconnect?: OnboardingOptionWhereInput | boolean
    delete?: OnboardingOptionWhereInput | boolean
    connect?: OnboardingOptionWhereUniqueInput
    update?: XOR<XOR<OnboardingOptionUpdateToOneWithWhereWithoutAnswersInput, OnboardingOptionUpdateWithoutAnswersInput>, OnboardingOptionUncheckedUpdateWithoutAnswersInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedEnumBlogPostTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.BlogPostType | EnumBlogPostTypeFieldRefInput<$PrismaModel>
    in?: $Enums.BlogPostType[] | ListEnumBlogPostTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.BlogPostType[] | ListEnumBlogPostTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumBlogPostTypeFilter<$PrismaModel> | $Enums.BlogPostType
  }

  export type NestedEnumBlogPostStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.BlogPostStatus | EnumBlogPostStatusFieldRefInput<$PrismaModel>
    in?: $Enums.BlogPostStatus[] | ListEnumBlogPostStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.BlogPostStatus[] | ListEnumBlogPostStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumBlogPostStatusFilter<$PrismaModel> | $Enums.BlogPostStatus
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedEnumBlogPostTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.BlogPostType | EnumBlogPostTypeFieldRefInput<$PrismaModel>
    in?: $Enums.BlogPostType[] | ListEnumBlogPostTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.BlogPostType[] | ListEnumBlogPostTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumBlogPostTypeWithAggregatesFilter<$PrismaModel> | $Enums.BlogPostType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumBlogPostTypeFilter<$PrismaModel>
    _max?: NestedEnumBlogPostTypeFilter<$PrismaModel>
  }

  export type NestedEnumBlogPostStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.BlogPostStatus | EnumBlogPostStatusFieldRefInput<$PrismaModel>
    in?: $Enums.BlogPostStatus[] | ListEnumBlogPostStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.BlogPostStatus[] | ListEnumBlogPostStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumBlogPostStatusWithAggregatesFilter<$PrismaModel> | $Enums.BlogPostStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumBlogPostStatusFilter<$PrismaModel>
    _max?: NestedEnumBlogPostStatusFilter<$PrismaModel>
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedEnumTagStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.TagStatus | EnumTagStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TagStatus[] | ListEnumTagStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TagStatus[] | ListEnumTagStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTagStatusFilter<$PrismaModel> | $Enums.TagStatus
  }

  export type NestedEnumTagStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TagStatus | EnumTagStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TagStatus[] | ListEnumTagStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TagStatus[] | ListEnumTagStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTagStatusWithAggregatesFilter<$PrismaModel> | $Enums.TagStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTagStatusFilter<$PrismaModel>
    _max?: NestedEnumTagStatusFilter<$PrismaModel>
  }

  export type NestedEnumQuestionTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.QuestionType | EnumQuestionTypeFieldRefInput<$PrismaModel>
    in?: $Enums.QuestionType[] | ListEnumQuestionTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.QuestionType[] | ListEnumQuestionTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumQuestionTypeFilter<$PrismaModel> | $Enums.QuestionType
  }

  export type NestedEnumQuestionTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.QuestionType | EnumQuestionTypeFieldRefInput<$PrismaModel>
    in?: $Enums.QuestionType[] | ListEnumQuestionTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.QuestionType[] | ListEnumQuestionTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumQuestionTypeWithAggregatesFilter<$PrismaModel> | $Enums.QuestionType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumQuestionTypeFilter<$PrismaModel>
    _max?: NestedEnumQuestionTypeFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumIntentTagFilter<$PrismaModel = never> = {
    equals?: $Enums.IntentTag | EnumIntentTagFieldRefInput<$PrismaModel>
    in?: $Enums.IntentTag[] | ListEnumIntentTagFieldRefInput<$PrismaModel>
    notIn?: $Enums.IntentTag[] | ListEnumIntentTagFieldRefInput<$PrismaModel>
    not?: NestedEnumIntentTagFilter<$PrismaModel> | $Enums.IntentTag
  }

  export type NestedEnumOrgSizeBracketFilter<$PrismaModel = never> = {
    equals?: $Enums.OrgSizeBracket | EnumOrgSizeBracketFieldRefInput<$PrismaModel>
    in?: $Enums.OrgSizeBracket[] | ListEnumOrgSizeBracketFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrgSizeBracket[] | ListEnumOrgSizeBracketFieldRefInput<$PrismaModel>
    not?: NestedEnumOrgSizeBracketFilter<$PrismaModel> | $Enums.OrgSizeBracket
  }

  export type NestedEnumIntentTagWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.IntentTag | EnumIntentTagFieldRefInput<$PrismaModel>
    in?: $Enums.IntentTag[] | ListEnumIntentTagFieldRefInput<$PrismaModel>
    notIn?: $Enums.IntentTag[] | ListEnumIntentTagFieldRefInput<$PrismaModel>
    not?: NestedEnumIntentTagWithAggregatesFilter<$PrismaModel> | $Enums.IntentTag
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumIntentTagFilter<$PrismaModel>
    _max?: NestedEnumIntentTagFilter<$PrismaModel>
  }

  export type NestedEnumOrgSizeBracketWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OrgSizeBracket | EnumOrgSizeBracketFieldRefInput<$PrismaModel>
    in?: $Enums.OrgSizeBracket[] | ListEnumOrgSizeBracketFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrgSizeBracket[] | ListEnumOrgSizeBracketFieldRefInput<$PrismaModel>
    not?: NestedEnumOrgSizeBracketWithAggregatesFilter<$PrismaModel> | $Enums.OrgSizeBracket
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumOrgSizeBracketFilter<$PrismaModel>
    _max?: NestedEnumOrgSizeBracketFilter<$PrismaModel>
  }

  export type BlogPostCreateWithoutAuthorInput = {
    id?: string
    type?: $Enums.BlogPostType
    title: string
    slug: string
    status: $Enums.BlogPostStatus
    content: JsonNullValueInput | InputJsonValue
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tags?: BlogTagCreateNestedManyWithoutPostsInput
    seo?: BlogSeoCreateNestedOneWithoutBlogPostInput
  }

  export type BlogPostUncheckedCreateWithoutAuthorInput = {
    id?: string
    type?: $Enums.BlogPostType
    title: string
    slug: string
    status: $Enums.BlogPostStatus
    content: JsonNullValueInput | InputJsonValue
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tags?: BlogTagUncheckedCreateNestedManyWithoutPostsInput
    seo?: BlogSeoUncheckedCreateNestedOneWithoutBlogPostInput
  }

  export type BlogPostCreateOrConnectWithoutAuthorInput = {
    where: BlogPostWhereUniqueInput
    create: XOR<BlogPostCreateWithoutAuthorInput, BlogPostUncheckedCreateWithoutAuthorInput>
  }

  export type BlogPostCreateManyAuthorInputEnvelope = {
    data: BlogPostCreateManyAuthorInput | BlogPostCreateManyAuthorInput[]
    skipDuplicates?: boolean
  }

  export type BlogPostUpsertWithWhereUniqueWithoutAuthorInput = {
    where: BlogPostWhereUniqueInput
    update: XOR<BlogPostUpdateWithoutAuthorInput, BlogPostUncheckedUpdateWithoutAuthorInput>
    create: XOR<BlogPostCreateWithoutAuthorInput, BlogPostUncheckedCreateWithoutAuthorInput>
  }

  export type BlogPostUpdateWithWhereUniqueWithoutAuthorInput = {
    where: BlogPostWhereUniqueInput
    data: XOR<BlogPostUpdateWithoutAuthorInput, BlogPostUncheckedUpdateWithoutAuthorInput>
  }

  export type BlogPostUpdateManyWithWhereWithoutAuthorInput = {
    where: BlogPostScalarWhereInput
    data: XOR<BlogPostUpdateManyMutationInput, BlogPostUncheckedUpdateManyWithoutAuthorInput>
  }

  export type BlogPostScalarWhereInput = {
    AND?: BlogPostScalarWhereInput | BlogPostScalarWhereInput[]
    OR?: BlogPostScalarWhereInput[]
    NOT?: BlogPostScalarWhereInput | BlogPostScalarWhereInput[]
    id?: StringFilter<"BlogPost"> | string
    type?: EnumBlogPostTypeFilter<"BlogPost"> | $Enums.BlogPostType
    title?: StringFilter<"BlogPost"> | string
    slug?: StringFilter<"BlogPost"> | string
    authorId?: StringFilter<"BlogPost"> | string
    status?: EnumBlogPostStatusFilter<"BlogPost"> | $Enums.BlogPostStatus
    content?: JsonFilter<"BlogPost">
    deletedAt?: DateTimeNullableFilter<"BlogPost"> | Date | string | null
    createdAt?: DateTimeFilter<"BlogPost"> | Date | string
    updatedAt?: DateTimeFilter<"BlogPost"> | Date | string
  }

  export type BlogTagCreateWithoutPostsInput = {
    id?: string
    tag: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BlogTagUncheckedCreateWithoutPostsInput = {
    id?: string
    tag: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BlogTagCreateOrConnectWithoutPostsInput = {
    where: BlogTagWhereUniqueInput
    create: XOR<BlogTagCreateWithoutPostsInput, BlogTagUncheckedCreateWithoutPostsInput>
  }

  export type AdminAccountCreateWithoutBlogPostInput = {
    id?: string
    name: string
    email: string
    picture?: string | null
    profileLink?: string | null
    designation?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AdminAccountUncheckedCreateWithoutBlogPostInput = {
    id?: string
    name: string
    email: string
    picture?: string | null
    profileLink?: string | null
    designation?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AdminAccountCreateOrConnectWithoutBlogPostInput = {
    where: AdminAccountWhereUniqueInput
    create: XOR<AdminAccountCreateWithoutBlogPostInput, AdminAccountUncheckedCreateWithoutBlogPostInput>
  }

  export type BlogSeoCreateWithoutBlogPostInput = {
    id?: string
    metaTitle?: string | null
    metaDescription?: string | null
    metaRobots?: string | null
    keywords?: string | null
    canonicalUrl?: string | null
    ogTitle?: string | null
    ogDescription?: string | null
    ogImage?: string | null
    ogUrl?: string | null
    ogType?: string | null
    ogSiteName?: string | null
    twitterCardType?: string | null
    twitterTitle?: string | null
    twitterDescription?: string | null
    twitterImage?: string | null
    twitterSite?: string | null
    blogpostingHeadline?: string | null
    blogpostingDescription?: string | null
    blogpostingAuthorName?: string | null
    blogpostingAuthorUrl?: string | null
    blogpostingPublisherName?: string | null
    blogpostingPublisherLogo?: string | null
    blogpostingKeywords?: string | null
    blogpostingFeaturedImage?: string | null
    mainEntityOfPage?: string | null
    favicon?: string | null
    language?: string | null
    faqEnabled?: boolean
    faqData?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BlogSeoUncheckedCreateWithoutBlogPostInput = {
    id?: string
    metaTitle?: string | null
    metaDescription?: string | null
    metaRobots?: string | null
    keywords?: string | null
    canonicalUrl?: string | null
    ogTitle?: string | null
    ogDescription?: string | null
    ogImage?: string | null
    ogUrl?: string | null
    ogType?: string | null
    ogSiteName?: string | null
    twitterCardType?: string | null
    twitterTitle?: string | null
    twitterDescription?: string | null
    twitterImage?: string | null
    twitterSite?: string | null
    blogpostingHeadline?: string | null
    blogpostingDescription?: string | null
    blogpostingAuthorName?: string | null
    blogpostingAuthorUrl?: string | null
    blogpostingPublisherName?: string | null
    blogpostingPublisherLogo?: string | null
    blogpostingKeywords?: string | null
    blogpostingFeaturedImage?: string | null
    mainEntityOfPage?: string | null
    favicon?: string | null
    language?: string | null
    faqEnabled?: boolean
    faqData?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BlogSeoCreateOrConnectWithoutBlogPostInput = {
    where: BlogSeoWhereUniqueInput
    create: XOR<BlogSeoCreateWithoutBlogPostInput, BlogSeoUncheckedCreateWithoutBlogPostInput>
  }

  export type BlogTagUpsertWithWhereUniqueWithoutPostsInput = {
    where: BlogTagWhereUniqueInput
    update: XOR<BlogTagUpdateWithoutPostsInput, BlogTagUncheckedUpdateWithoutPostsInput>
    create: XOR<BlogTagCreateWithoutPostsInput, BlogTagUncheckedCreateWithoutPostsInput>
  }

  export type BlogTagUpdateWithWhereUniqueWithoutPostsInput = {
    where: BlogTagWhereUniqueInput
    data: XOR<BlogTagUpdateWithoutPostsInput, BlogTagUncheckedUpdateWithoutPostsInput>
  }

  export type BlogTagUpdateManyWithWhereWithoutPostsInput = {
    where: BlogTagScalarWhereInput
    data: XOR<BlogTagUpdateManyMutationInput, BlogTagUncheckedUpdateManyWithoutPostsInput>
  }

  export type BlogTagScalarWhereInput = {
    AND?: BlogTagScalarWhereInput | BlogTagScalarWhereInput[]
    OR?: BlogTagScalarWhereInput[]
    NOT?: BlogTagScalarWhereInput | BlogTagScalarWhereInput[]
    id?: StringFilter<"BlogTag"> | string
    tag?: StringFilter<"BlogTag"> | string
    createdAt?: DateTimeFilter<"BlogTag"> | Date | string
    updatedAt?: DateTimeFilter<"BlogTag"> | Date | string
  }

  export type AdminAccountUpsertWithoutBlogPostInput = {
    update: XOR<AdminAccountUpdateWithoutBlogPostInput, AdminAccountUncheckedUpdateWithoutBlogPostInput>
    create: XOR<AdminAccountCreateWithoutBlogPostInput, AdminAccountUncheckedCreateWithoutBlogPostInput>
    where?: AdminAccountWhereInput
  }

  export type AdminAccountUpdateToOneWithWhereWithoutBlogPostInput = {
    where?: AdminAccountWhereInput
    data: XOR<AdminAccountUpdateWithoutBlogPostInput, AdminAccountUncheckedUpdateWithoutBlogPostInput>
  }

  export type AdminAccountUpdateWithoutBlogPostInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    picture?: NullableStringFieldUpdateOperationsInput | string | null
    profileLink?: NullableStringFieldUpdateOperationsInput | string | null
    designation?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AdminAccountUncheckedUpdateWithoutBlogPostInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    picture?: NullableStringFieldUpdateOperationsInput | string | null
    profileLink?: NullableStringFieldUpdateOperationsInput | string | null
    designation?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BlogSeoUpsertWithoutBlogPostInput = {
    update: XOR<BlogSeoUpdateWithoutBlogPostInput, BlogSeoUncheckedUpdateWithoutBlogPostInput>
    create: XOR<BlogSeoCreateWithoutBlogPostInput, BlogSeoUncheckedCreateWithoutBlogPostInput>
    where?: BlogSeoWhereInput
  }

  export type BlogSeoUpdateToOneWithWhereWithoutBlogPostInput = {
    where?: BlogSeoWhereInput
    data: XOR<BlogSeoUpdateWithoutBlogPostInput, BlogSeoUncheckedUpdateWithoutBlogPostInput>
  }

  export type BlogSeoUpdateWithoutBlogPostInput = {
    id?: StringFieldUpdateOperationsInput | string
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    metaRobots?: NullableStringFieldUpdateOperationsInput | string | null
    keywords?: NullableStringFieldUpdateOperationsInput | string | null
    canonicalUrl?: NullableStringFieldUpdateOperationsInput | string | null
    ogTitle?: NullableStringFieldUpdateOperationsInput | string | null
    ogDescription?: NullableStringFieldUpdateOperationsInput | string | null
    ogImage?: NullableStringFieldUpdateOperationsInput | string | null
    ogUrl?: NullableStringFieldUpdateOperationsInput | string | null
    ogType?: NullableStringFieldUpdateOperationsInput | string | null
    ogSiteName?: NullableStringFieldUpdateOperationsInput | string | null
    twitterCardType?: NullableStringFieldUpdateOperationsInput | string | null
    twitterTitle?: NullableStringFieldUpdateOperationsInput | string | null
    twitterDescription?: NullableStringFieldUpdateOperationsInput | string | null
    twitterImage?: NullableStringFieldUpdateOperationsInput | string | null
    twitterSite?: NullableStringFieldUpdateOperationsInput | string | null
    blogpostingHeadline?: NullableStringFieldUpdateOperationsInput | string | null
    blogpostingDescription?: NullableStringFieldUpdateOperationsInput | string | null
    blogpostingAuthorName?: NullableStringFieldUpdateOperationsInput | string | null
    blogpostingAuthorUrl?: NullableStringFieldUpdateOperationsInput | string | null
    blogpostingPublisherName?: NullableStringFieldUpdateOperationsInput | string | null
    blogpostingPublisherLogo?: NullableStringFieldUpdateOperationsInput | string | null
    blogpostingKeywords?: NullableStringFieldUpdateOperationsInput | string | null
    blogpostingFeaturedImage?: NullableStringFieldUpdateOperationsInput | string | null
    mainEntityOfPage?: NullableStringFieldUpdateOperationsInput | string | null
    favicon?: NullableStringFieldUpdateOperationsInput | string | null
    language?: NullableStringFieldUpdateOperationsInput | string | null
    faqEnabled?: BoolFieldUpdateOperationsInput | boolean
    faqData?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BlogSeoUncheckedUpdateWithoutBlogPostInput = {
    id?: StringFieldUpdateOperationsInput | string
    metaTitle?: NullableStringFieldUpdateOperationsInput | string | null
    metaDescription?: NullableStringFieldUpdateOperationsInput | string | null
    metaRobots?: NullableStringFieldUpdateOperationsInput | string | null
    keywords?: NullableStringFieldUpdateOperationsInput | string | null
    canonicalUrl?: NullableStringFieldUpdateOperationsInput | string | null
    ogTitle?: NullableStringFieldUpdateOperationsInput | string | null
    ogDescription?: NullableStringFieldUpdateOperationsInput | string | null
    ogImage?: NullableStringFieldUpdateOperationsInput | string | null
    ogUrl?: NullableStringFieldUpdateOperationsInput | string | null
    ogType?: NullableStringFieldUpdateOperationsInput | string | null
    ogSiteName?: NullableStringFieldUpdateOperationsInput | string | null
    twitterCardType?: NullableStringFieldUpdateOperationsInput | string | null
    twitterTitle?: NullableStringFieldUpdateOperationsInput | string | null
    twitterDescription?: NullableStringFieldUpdateOperationsInput | string | null
    twitterImage?: NullableStringFieldUpdateOperationsInput | string | null
    twitterSite?: NullableStringFieldUpdateOperationsInput | string | null
    blogpostingHeadline?: NullableStringFieldUpdateOperationsInput | string | null
    blogpostingDescription?: NullableStringFieldUpdateOperationsInput | string | null
    blogpostingAuthorName?: NullableStringFieldUpdateOperationsInput | string | null
    blogpostingAuthorUrl?: NullableStringFieldUpdateOperationsInput | string | null
    blogpostingPublisherName?: NullableStringFieldUpdateOperationsInput | string | null
    blogpostingPublisherLogo?: NullableStringFieldUpdateOperationsInput | string | null
    blogpostingKeywords?: NullableStringFieldUpdateOperationsInput | string | null
    blogpostingFeaturedImage?: NullableStringFieldUpdateOperationsInput | string | null
    mainEntityOfPage?: NullableStringFieldUpdateOperationsInput | string | null
    favicon?: NullableStringFieldUpdateOperationsInput | string | null
    language?: NullableStringFieldUpdateOperationsInput | string | null
    faqEnabled?: BoolFieldUpdateOperationsInput | boolean
    faqData?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BlogPostCreateWithoutTagsInput = {
    id?: string
    type?: $Enums.BlogPostType
    title: string
    slug: string
    status: $Enums.BlogPostStatus
    content: JsonNullValueInput | InputJsonValue
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    author: AdminAccountCreateNestedOneWithoutBlogPostInput
    seo?: BlogSeoCreateNestedOneWithoutBlogPostInput
  }

  export type BlogPostUncheckedCreateWithoutTagsInput = {
    id?: string
    type?: $Enums.BlogPostType
    title: string
    slug: string
    authorId: string
    status: $Enums.BlogPostStatus
    content: JsonNullValueInput | InputJsonValue
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    seo?: BlogSeoUncheckedCreateNestedOneWithoutBlogPostInput
  }

  export type BlogPostCreateOrConnectWithoutTagsInput = {
    where: BlogPostWhereUniqueInput
    create: XOR<BlogPostCreateWithoutTagsInput, BlogPostUncheckedCreateWithoutTagsInput>
  }

  export type BlogPostUpsertWithWhereUniqueWithoutTagsInput = {
    where: BlogPostWhereUniqueInput
    update: XOR<BlogPostUpdateWithoutTagsInput, BlogPostUncheckedUpdateWithoutTagsInput>
    create: XOR<BlogPostCreateWithoutTagsInput, BlogPostUncheckedCreateWithoutTagsInput>
  }

  export type BlogPostUpdateWithWhereUniqueWithoutTagsInput = {
    where: BlogPostWhereUniqueInput
    data: XOR<BlogPostUpdateWithoutTagsInput, BlogPostUncheckedUpdateWithoutTagsInput>
  }

  export type BlogPostUpdateManyWithWhereWithoutTagsInput = {
    where: BlogPostScalarWhereInput
    data: XOR<BlogPostUpdateManyMutationInput, BlogPostUncheckedUpdateManyWithoutTagsInput>
  }

  export type BlogPostCreateWithoutSeoInput = {
    id?: string
    type?: $Enums.BlogPostType
    title: string
    slug: string
    status: $Enums.BlogPostStatus
    content: JsonNullValueInput | InputJsonValue
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tags?: BlogTagCreateNestedManyWithoutPostsInput
    author: AdminAccountCreateNestedOneWithoutBlogPostInput
  }

  export type BlogPostUncheckedCreateWithoutSeoInput = {
    id?: string
    type?: $Enums.BlogPostType
    title: string
    slug: string
    authorId: string
    status: $Enums.BlogPostStatus
    content: JsonNullValueInput | InputJsonValue
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tags?: BlogTagUncheckedCreateNestedManyWithoutPostsInput
  }

  export type BlogPostCreateOrConnectWithoutSeoInput = {
    where: BlogPostWhereUniqueInput
    create: XOR<BlogPostCreateWithoutSeoInput, BlogPostUncheckedCreateWithoutSeoInput>
  }

  export type BlogPostUpsertWithoutSeoInput = {
    update: XOR<BlogPostUpdateWithoutSeoInput, BlogPostUncheckedUpdateWithoutSeoInput>
    create: XOR<BlogPostCreateWithoutSeoInput, BlogPostUncheckedCreateWithoutSeoInput>
    where?: BlogPostWhereInput
  }

  export type BlogPostUpdateToOneWithWhereWithoutSeoInput = {
    where?: BlogPostWhereInput
    data: XOR<BlogPostUpdateWithoutSeoInput, BlogPostUncheckedUpdateWithoutSeoInput>
  }

  export type BlogPostUpdateWithoutSeoInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumBlogPostTypeFieldUpdateOperationsInput | $Enums.BlogPostType
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    status?: EnumBlogPostStatusFieldUpdateOperationsInput | $Enums.BlogPostStatus
    content?: JsonNullValueInput | InputJsonValue
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tags?: BlogTagUpdateManyWithoutPostsNestedInput
    author?: AdminAccountUpdateOneRequiredWithoutBlogPostNestedInput
  }

  export type BlogPostUncheckedUpdateWithoutSeoInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumBlogPostTypeFieldUpdateOperationsInput | $Enums.BlogPostType
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    authorId?: StringFieldUpdateOperationsInput | string
    status?: EnumBlogPostStatusFieldUpdateOperationsInput | $Enums.BlogPostStatus
    content?: JsonNullValueInput | InputJsonValue
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tags?: BlogTagUncheckedUpdateManyWithoutPostsNestedInput
  }

  export type OnboardingQuestionCreateWithoutVersionInput = {
    id?: string
    slug: string
    type: $Enums.QuestionType
    title: string
    iconSlug?: string | null
    isActive?: boolean
    sortOrder?: number
    allowOtherOption?: boolean
    createdAt?: Date | string
    options?: OnboardingOptionCreateNestedManyWithoutQuestionInput
    answers?: OnboardingAnswerCreateNestedManyWithoutQuestionInput
  }

  export type OnboardingQuestionUncheckedCreateWithoutVersionInput = {
    id?: string
    slug: string
    type: $Enums.QuestionType
    title: string
    iconSlug?: string | null
    isActive?: boolean
    sortOrder?: number
    allowOtherOption?: boolean
    createdAt?: Date | string
    options?: OnboardingOptionUncheckedCreateNestedManyWithoutQuestionInput
    answers?: OnboardingAnswerUncheckedCreateNestedManyWithoutQuestionInput
  }

  export type OnboardingQuestionCreateOrConnectWithoutVersionInput = {
    where: OnboardingQuestionWhereUniqueInput
    create: XOR<OnboardingQuestionCreateWithoutVersionInput, OnboardingQuestionUncheckedCreateWithoutVersionInput>
  }

  export type OnboardingQuestionCreateManyVersionInputEnvelope = {
    data: OnboardingQuestionCreateManyVersionInput | OnboardingQuestionCreateManyVersionInput[]
    skipDuplicates?: boolean
  }

  export type OnboardingResponseCreateWithoutTagVersionInput = {
    id?: string
    userId: string
    email: string
    clientFingerprint: string
    intentTag: $Enums.IntentTag
    orgSizeBracket: $Enums.OrgSizeBracket
    createdAt?: Date | string
    answers?: OnboardingAnswerCreateNestedManyWithoutResponseInput
  }

  export type OnboardingResponseUncheckedCreateWithoutTagVersionInput = {
    id?: string
    userId: string
    email: string
    clientFingerprint: string
    intentTag: $Enums.IntentTag
    orgSizeBracket: $Enums.OrgSizeBracket
    createdAt?: Date | string
    answers?: OnboardingAnswerUncheckedCreateNestedManyWithoutResponseInput
  }

  export type OnboardingResponseCreateOrConnectWithoutTagVersionInput = {
    where: OnboardingResponseWhereUniqueInput
    create: XOR<OnboardingResponseCreateWithoutTagVersionInput, OnboardingResponseUncheckedCreateWithoutTagVersionInput>
  }

  export type OnboardingResponseCreateManyTagVersionInputEnvelope = {
    data: OnboardingResponseCreateManyTagVersionInput | OnboardingResponseCreateManyTagVersionInput[]
    skipDuplicates?: boolean
  }

  export type OnboardingQuestionUpsertWithWhereUniqueWithoutVersionInput = {
    where: OnboardingQuestionWhereUniqueInput
    update: XOR<OnboardingQuestionUpdateWithoutVersionInput, OnboardingQuestionUncheckedUpdateWithoutVersionInput>
    create: XOR<OnboardingQuestionCreateWithoutVersionInput, OnboardingQuestionUncheckedCreateWithoutVersionInput>
  }

  export type OnboardingQuestionUpdateWithWhereUniqueWithoutVersionInput = {
    where: OnboardingQuestionWhereUniqueInput
    data: XOR<OnboardingQuestionUpdateWithoutVersionInput, OnboardingQuestionUncheckedUpdateWithoutVersionInput>
  }

  export type OnboardingQuestionUpdateManyWithWhereWithoutVersionInput = {
    where: OnboardingQuestionScalarWhereInput
    data: XOR<OnboardingQuestionUpdateManyMutationInput, OnboardingQuestionUncheckedUpdateManyWithoutVersionInput>
  }

  export type OnboardingQuestionScalarWhereInput = {
    AND?: OnboardingQuestionScalarWhereInput | OnboardingQuestionScalarWhereInput[]
    OR?: OnboardingQuestionScalarWhereInput[]
    NOT?: OnboardingQuestionScalarWhereInput | OnboardingQuestionScalarWhereInput[]
    id?: StringFilter<"OnboardingQuestion"> | string
    versionId?: StringFilter<"OnboardingQuestion"> | string
    slug?: StringFilter<"OnboardingQuestion"> | string
    type?: EnumQuestionTypeFilter<"OnboardingQuestion"> | $Enums.QuestionType
    title?: StringFilter<"OnboardingQuestion"> | string
    iconSlug?: StringNullableFilter<"OnboardingQuestion"> | string | null
    isActive?: BoolFilter<"OnboardingQuestion"> | boolean
    sortOrder?: IntFilter<"OnboardingQuestion"> | number
    allowOtherOption?: BoolFilter<"OnboardingQuestion"> | boolean
    createdAt?: DateTimeFilter<"OnboardingQuestion"> | Date | string
  }

  export type OnboardingResponseUpsertWithWhereUniqueWithoutTagVersionInput = {
    where: OnboardingResponseWhereUniqueInput
    update: XOR<OnboardingResponseUpdateWithoutTagVersionInput, OnboardingResponseUncheckedUpdateWithoutTagVersionInput>
    create: XOR<OnboardingResponseCreateWithoutTagVersionInput, OnboardingResponseUncheckedCreateWithoutTagVersionInput>
  }

  export type OnboardingResponseUpdateWithWhereUniqueWithoutTagVersionInput = {
    where: OnboardingResponseWhereUniqueInput
    data: XOR<OnboardingResponseUpdateWithoutTagVersionInput, OnboardingResponseUncheckedUpdateWithoutTagVersionInput>
  }

  export type OnboardingResponseUpdateManyWithWhereWithoutTagVersionInput = {
    where: OnboardingResponseScalarWhereInput
    data: XOR<OnboardingResponseUpdateManyMutationInput, OnboardingResponseUncheckedUpdateManyWithoutTagVersionInput>
  }

  export type OnboardingResponseScalarWhereInput = {
    AND?: OnboardingResponseScalarWhereInput | OnboardingResponseScalarWhereInput[]
    OR?: OnboardingResponseScalarWhereInput[]
    NOT?: OnboardingResponseScalarWhereInput | OnboardingResponseScalarWhereInput[]
    id?: StringFilter<"OnboardingResponse"> | string
    userId?: StringFilter<"OnboardingResponse"> | string
    email?: StringFilter<"OnboardingResponse"> | string
    clientFingerprint?: StringFilter<"OnboardingResponse"> | string
    intentTag?: EnumIntentTagFilter<"OnboardingResponse"> | $Enums.IntentTag
    orgSizeBracket?: EnumOrgSizeBracketFilter<"OnboardingResponse"> | $Enums.OrgSizeBracket
    tagVersionId?: StringFilter<"OnboardingResponse"> | string
    createdAt?: DateTimeFilter<"OnboardingResponse"> | Date | string
  }

  export type OnboardingTagVersionCreateWithoutQuestionsInput = {
    id?: string
    tag: string
    title: string
    description?: string | null
    status?: $Enums.TagStatus
    createdAt?: Date | string
    publishedAt?: Date | string | null
    responses?: OnboardingResponseCreateNestedManyWithoutTagVersionInput
  }

  export type OnboardingTagVersionUncheckedCreateWithoutQuestionsInput = {
    id?: string
    tag: string
    title: string
    description?: string | null
    status?: $Enums.TagStatus
    createdAt?: Date | string
    publishedAt?: Date | string | null
    responses?: OnboardingResponseUncheckedCreateNestedManyWithoutTagVersionInput
  }

  export type OnboardingTagVersionCreateOrConnectWithoutQuestionsInput = {
    where: OnboardingTagVersionWhereUniqueInput
    create: XOR<OnboardingTagVersionCreateWithoutQuestionsInput, OnboardingTagVersionUncheckedCreateWithoutQuestionsInput>
  }

  export type OnboardingOptionCreateWithoutQuestionInput = {
    id?: string
    value: string
    label: string
    iconSlug?: string | null
    sortOrder?: number | null
    answers?: OnboardingAnswerCreateNestedManyWithoutOptionInput
  }

  export type OnboardingOptionUncheckedCreateWithoutQuestionInput = {
    id?: string
    value: string
    label: string
    iconSlug?: string | null
    sortOrder?: number | null
    answers?: OnboardingAnswerUncheckedCreateNestedManyWithoutOptionInput
  }

  export type OnboardingOptionCreateOrConnectWithoutQuestionInput = {
    where: OnboardingOptionWhereUniqueInput
    create: XOR<OnboardingOptionCreateWithoutQuestionInput, OnboardingOptionUncheckedCreateWithoutQuestionInput>
  }

  export type OnboardingOptionCreateManyQuestionInputEnvelope = {
    data: OnboardingOptionCreateManyQuestionInput | OnboardingOptionCreateManyQuestionInput[]
    skipDuplicates?: boolean
  }

  export type OnboardingAnswerCreateWithoutQuestionInput = {
    id?: string
    customValue?: string | null
    response: OnboardingResponseCreateNestedOneWithoutAnswersInput
    option?: OnboardingOptionCreateNestedOneWithoutAnswersInput
  }

  export type OnboardingAnswerUncheckedCreateWithoutQuestionInput = {
    id?: string
    responseId: string
    optionId?: string | null
    customValue?: string | null
  }

  export type OnboardingAnswerCreateOrConnectWithoutQuestionInput = {
    where: OnboardingAnswerWhereUniqueInput
    create: XOR<OnboardingAnswerCreateWithoutQuestionInput, OnboardingAnswerUncheckedCreateWithoutQuestionInput>
  }

  export type OnboardingAnswerCreateManyQuestionInputEnvelope = {
    data: OnboardingAnswerCreateManyQuestionInput | OnboardingAnswerCreateManyQuestionInput[]
    skipDuplicates?: boolean
  }

  export type OnboardingTagVersionUpsertWithoutQuestionsInput = {
    update: XOR<OnboardingTagVersionUpdateWithoutQuestionsInput, OnboardingTagVersionUncheckedUpdateWithoutQuestionsInput>
    create: XOR<OnboardingTagVersionCreateWithoutQuestionsInput, OnboardingTagVersionUncheckedCreateWithoutQuestionsInput>
    where?: OnboardingTagVersionWhereInput
  }

  export type OnboardingTagVersionUpdateToOneWithWhereWithoutQuestionsInput = {
    where?: OnboardingTagVersionWhereInput
    data: XOR<OnboardingTagVersionUpdateWithoutQuestionsInput, OnboardingTagVersionUncheckedUpdateWithoutQuestionsInput>
  }

  export type OnboardingTagVersionUpdateWithoutQuestionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    tag?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumTagStatusFieldUpdateOperationsInput | $Enums.TagStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    responses?: OnboardingResponseUpdateManyWithoutTagVersionNestedInput
  }

  export type OnboardingTagVersionUncheckedUpdateWithoutQuestionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    tag?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumTagStatusFieldUpdateOperationsInput | $Enums.TagStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    responses?: OnboardingResponseUncheckedUpdateManyWithoutTagVersionNestedInput
  }

  export type OnboardingOptionUpsertWithWhereUniqueWithoutQuestionInput = {
    where: OnboardingOptionWhereUniqueInput
    update: XOR<OnboardingOptionUpdateWithoutQuestionInput, OnboardingOptionUncheckedUpdateWithoutQuestionInput>
    create: XOR<OnboardingOptionCreateWithoutQuestionInput, OnboardingOptionUncheckedCreateWithoutQuestionInput>
  }

  export type OnboardingOptionUpdateWithWhereUniqueWithoutQuestionInput = {
    where: OnboardingOptionWhereUniqueInput
    data: XOR<OnboardingOptionUpdateWithoutQuestionInput, OnboardingOptionUncheckedUpdateWithoutQuestionInput>
  }

  export type OnboardingOptionUpdateManyWithWhereWithoutQuestionInput = {
    where: OnboardingOptionScalarWhereInput
    data: XOR<OnboardingOptionUpdateManyMutationInput, OnboardingOptionUncheckedUpdateManyWithoutQuestionInput>
  }

  export type OnboardingOptionScalarWhereInput = {
    AND?: OnboardingOptionScalarWhereInput | OnboardingOptionScalarWhereInput[]
    OR?: OnboardingOptionScalarWhereInput[]
    NOT?: OnboardingOptionScalarWhereInput | OnboardingOptionScalarWhereInput[]
    id?: StringFilter<"OnboardingOption"> | string
    questionId?: StringFilter<"OnboardingOption"> | string
    value?: StringFilter<"OnboardingOption"> | string
    label?: StringFilter<"OnboardingOption"> | string
    iconSlug?: StringNullableFilter<"OnboardingOption"> | string | null
    sortOrder?: IntNullableFilter<"OnboardingOption"> | number | null
  }

  export type OnboardingAnswerUpsertWithWhereUniqueWithoutQuestionInput = {
    where: OnboardingAnswerWhereUniqueInput
    update: XOR<OnboardingAnswerUpdateWithoutQuestionInput, OnboardingAnswerUncheckedUpdateWithoutQuestionInput>
    create: XOR<OnboardingAnswerCreateWithoutQuestionInput, OnboardingAnswerUncheckedCreateWithoutQuestionInput>
  }

  export type OnboardingAnswerUpdateWithWhereUniqueWithoutQuestionInput = {
    where: OnboardingAnswerWhereUniqueInput
    data: XOR<OnboardingAnswerUpdateWithoutQuestionInput, OnboardingAnswerUncheckedUpdateWithoutQuestionInput>
  }

  export type OnboardingAnswerUpdateManyWithWhereWithoutQuestionInput = {
    where: OnboardingAnswerScalarWhereInput
    data: XOR<OnboardingAnswerUpdateManyMutationInput, OnboardingAnswerUncheckedUpdateManyWithoutQuestionInput>
  }

  export type OnboardingAnswerScalarWhereInput = {
    AND?: OnboardingAnswerScalarWhereInput | OnboardingAnswerScalarWhereInput[]
    OR?: OnboardingAnswerScalarWhereInput[]
    NOT?: OnboardingAnswerScalarWhereInput | OnboardingAnswerScalarWhereInput[]
    id?: StringFilter<"OnboardingAnswer"> | string
    responseId?: StringFilter<"OnboardingAnswer"> | string
    questionId?: StringFilter<"OnboardingAnswer"> | string
    optionId?: StringNullableFilter<"OnboardingAnswer"> | string | null
    customValue?: StringNullableFilter<"OnboardingAnswer"> | string | null
  }

  export type OnboardingQuestionCreateWithoutOptionsInput = {
    id?: string
    slug: string
    type: $Enums.QuestionType
    title: string
    iconSlug?: string | null
    isActive?: boolean
    sortOrder?: number
    allowOtherOption?: boolean
    createdAt?: Date | string
    version: OnboardingTagVersionCreateNestedOneWithoutQuestionsInput
    answers?: OnboardingAnswerCreateNestedManyWithoutQuestionInput
  }

  export type OnboardingQuestionUncheckedCreateWithoutOptionsInput = {
    id?: string
    versionId: string
    slug: string
    type: $Enums.QuestionType
    title: string
    iconSlug?: string | null
    isActive?: boolean
    sortOrder?: number
    allowOtherOption?: boolean
    createdAt?: Date | string
    answers?: OnboardingAnswerUncheckedCreateNestedManyWithoutQuestionInput
  }

  export type OnboardingQuestionCreateOrConnectWithoutOptionsInput = {
    where: OnboardingQuestionWhereUniqueInput
    create: XOR<OnboardingQuestionCreateWithoutOptionsInput, OnboardingQuestionUncheckedCreateWithoutOptionsInput>
  }

  export type OnboardingAnswerCreateWithoutOptionInput = {
    id?: string
    customValue?: string | null
    response: OnboardingResponseCreateNestedOneWithoutAnswersInput
    question: OnboardingQuestionCreateNestedOneWithoutAnswersInput
  }

  export type OnboardingAnswerUncheckedCreateWithoutOptionInput = {
    id?: string
    responseId: string
    questionId: string
    customValue?: string | null
  }

  export type OnboardingAnswerCreateOrConnectWithoutOptionInput = {
    where: OnboardingAnswerWhereUniqueInput
    create: XOR<OnboardingAnswerCreateWithoutOptionInput, OnboardingAnswerUncheckedCreateWithoutOptionInput>
  }

  export type OnboardingAnswerCreateManyOptionInputEnvelope = {
    data: OnboardingAnswerCreateManyOptionInput | OnboardingAnswerCreateManyOptionInput[]
    skipDuplicates?: boolean
  }

  export type OnboardingQuestionUpsertWithoutOptionsInput = {
    update: XOR<OnboardingQuestionUpdateWithoutOptionsInput, OnboardingQuestionUncheckedUpdateWithoutOptionsInput>
    create: XOR<OnboardingQuestionCreateWithoutOptionsInput, OnboardingQuestionUncheckedCreateWithoutOptionsInput>
    where?: OnboardingQuestionWhereInput
  }

  export type OnboardingQuestionUpdateToOneWithWhereWithoutOptionsInput = {
    where?: OnboardingQuestionWhereInput
    data: XOR<OnboardingQuestionUpdateWithoutOptionsInput, OnboardingQuestionUncheckedUpdateWithoutOptionsInput>
  }

  export type OnboardingQuestionUpdateWithoutOptionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    type?: EnumQuestionTypeFieldUpdateOperationsInput | $Enums.QuestionType
    title?: StringFieldUpdateOperationsInput | string
    iconSlug?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    allowOtherOption?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    version?: OnboardingTagVersionUpdateOneRequiredWithoutQuestionsNestedInput
    answers?: OnboardingAnswerUpdateManyWithoutQuestionNestedInput
  }

  export type OnboardingQuestionUncheckedUpdateWithoutOptionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    versionId?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    type?: EnumQuestionTypeFieldUpdateOperationsInput | $Enums.QuestionType
    title?: StringFieldUpdateOperationsInput | string
    iconSlug?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    allowOtherOption?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    answers?: OnboardingAnswerUncheckedUpdateManyWithoutQuestionNestedInput
  }

  export type OnboardingAnswerUpsertWithWhereUniqueWithoutOptionInput = {
    where: OnboardingAnswerWhereUniqueInput
    update: XOR<OnboardingAnswerUpdateWithoutOptionInput, OnboardingAnswerUncheckedUpdateWithoutOptionInput>
    create: XOR<OnboardingAnswerCreateWithoutOptionInput, OnboardingAnswerUncheckedCreateWithoutOptionInput>
  }

  export type OnboardingAnswerUpdateWithWhereUniqueWithoutOptionInput = {
    where: OnboardingAnswerWhereUniqueInput
    data: XOR<OnboardingAnswerUpdateWithoutOptionInput, OnboardingAnswerUncheckedUpdateWithoutOptionInput>
  }

  export type OnboardingAnswerUpdateManyWithWhereWithoutOptionInput = {
    where: OnboardingAnswerScalarWhereInput
    data: XOR<OnboardingAnswerUpdateManyMutationInput, OnboardingAnswerUncheckedUpdateManyWithoutOptionInput>
  }

  export type OnboardingTagVersionCreateWithoutResponsesInput = {
    id?: string
    tag: string
    title: string
    description?: string | null
    status?: $Enums.TagStatus
    createdAt?: Date | string
    publishedAt?: Date | string | null
    questions?: OnboardingQuestionCreateNestedManyWithoutVersionInput
  }

  export type OnboardingTagVersionUncheckedCreateWithoutResponsesInput = {
    id?: string
    tag: string
    title: string
    description?: string | null
    status?: $Enums.TagStatus
    createdAt?: Date | string
    publishedAt?: Date | string | null
    questions?: OnboardingQuestionUncheckedCreateNestedManyWithoutVersionInput
  }

  export type OnboardingTagVersionCreateOrConnectWithoutResponsesInput = {
    where: OnboardingTagVersionWhereUniqueInput
    create: XOR<OnboardingTagVersionCreateWithoutResponsesInput, OnboardingTagVersionUncheckedCreateWithoutResponsesInput>
  }

  export type OnboardingAnswerCreateWithoutResponseInput = {
    id?: string
    customValue?: string | null
    question: OnboardingQuestionCreateNestedOneWithoutAnswersInput
    option?: OnboardingOptionCreateNestedOneWithoutAnswersInput
  }

  export type OnboardingAnswerUncheckedCreateWithoutResponseInput = {
    id?: string
    questionId: string
    optionId?: string | null
    customValue?: string | null
  }

  export type OnboardingAnswerCreateOrConnectWithoutResponseInput = {
    where: OnboardingAnswerWhereUniqueInput
    create: XOR<OnboardingAnswerCreateWithoutResponseInput, OnboardingAnswerUncheckedCreateWithoutResponseInput>
  }

  export type OnboardingAnswerCreateManyResponseInputEnvelope = {
    data: OnboardingAnswerCreateManyResponseInput | OnboardingAnswerCreateManyResponseInput[]
    skipDuplicates?: boolean
  }

  export type OnboardingTagVersionUpsertWithoutResponsesInput = {
    update: XOR<OnboardingTagVersionUpdateWithoutResponsesInput, OnboardingTagVersionUncheckedUpdateWithoutResponsesInput>
    create: XOR<OnboardingTagVersionCreateWithoutResponsesInput, OnboardingTagVersionUncheckedCreateWithoutResponsesInput>
    where?: OnboardingTagVersionWhereInput
  }

  export type OnboardingTagVersionUpdateToOneWithWhereWithoutResponsesInput = {
    where?: OnboardingTagVersionWhereInput
    data: XOR<OnboardingTagVersionUpdateWithoutResponsesInput, OnboardingTagVersionUncheckedUpdateWithoutResponsesInput>
  }

  export type OnboardingTagVersionUpdateWithoutResponsesInput = {
    id?: StringFieldUpdateOperationsInput | string
    tag?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumTagStatusFieldUpdateOperationsInput | $Enums.TagStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    questions?: OnboardingQuestionUpdateManyWithoutVersionNestedInput
  }

  export type OnboardingTagVersionUncheckedUpdateWithoutResponsesInput = {
    id?: StringFieldUpdateOperationsInput | string
    tag?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumTagStatusFieldUpdateOperationsInput | $Enums.TagStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    questions?: OnboardingQuestionUncheckedUpdateManyWithoutVersionNestedInput
  }

  export type OnboardingAnswerUpsertWithWhereUniqueWithoutResponseInput = {
    where: OnboardingAnswerWhereUniqueInput
    update: XOR<OnboardingAnswerUpdateWithoutResponseInput, OnboardingAnswerUncheckedUpdateWithoutResponseInput>
    create: XOR<OnboardingAnswerCreateWithoutResponseInput, OnboardingAnswerUncheckedCreateWithoutResponseInput>
  }

  export type OnboardingAnswerUpdateWithWhereUniqueWithoutResponseInput = {
    where: OnboardingAnswerWhereUniqueInput
    data: XOR<OnboardingAnswerUpdateWithoutResponseInput, OnboardingAnswerUncheckedUpdateWithoutResponseInput>
  }

  export type OnboardingAnswerUpdateManyWithWhereWithoutResponseInput = {
    where: OnboardingAnswerScalarWhereInput
    data: XOR<OnboardingAnswerUpdateManyMutationInput, OnboardingAnswerUncheckedUpdateManyWithoutResponseInput>
  }

  export type OnboardingResponseCreateWithoutAnswersInput = {
    id?: string
    userId: string
    email: string
    clientFingerprint: string
    intentTag: $Enums.IntentTag
    orgSizeBracket: $Enums.OrgSizeBracket
    createdAt?: Date | string
    tagVersion: OnboardingTagVersionCreateNestedOneWithoutResponsesInput
  }

  export type OnboardingResponseUncheckedCreateWithoutAnswersInput = {
    id?: string
    userId: string
    email: string
    clientFingerprint: string
    intentTag: $Enums.IntentTag
    orgSizeBracket: $Enums.OrgSizeBracket
    tagVersionId: string
    createdAt?: Date | string
  }

  export type OnboardingResponseCreateOrConnectWithoutAnswersInput = {
    where: OnboardingResponseWhereUniqueInput
    create: XOR<OnboardingResponseCreateWithoutAnswersInput, OnboardingResponseUncheckedCreateWithoutAnswersInput>
  }

  export type OnboardingQuestionCreateWithoutAnswersInput = {
    id?: string
    slug: string
    type: $Enums.QuestionType
    title: string
    iconSlug?: string | null
    isActive?: boolean
    sortOrder?: number
    allowOtherOption?: boolean
    createdAt?: Date | string
    version: OnboardingTagVersionCreateNestedOneWithoutQuestionsInput
    options?: OnboardingOptionCreateNestedManyWithoutQuestionInput
  }

  export type OnboardingQuestionUncheckedCreateWithoutAnswersInput = {
    id?: string
    versionId: string
    slug: string
    type: $Enums.QuestionType
    title: string
    iconSlug?: string | null
    isActive?: boolean
    sortOrder?: number
    allowOtherOption?: boolean
    createdAt?: Date | string
    options?: OnboardingOptionUncheckedCreateNestedManyWithoutQuestionInput
  }

  export type OnboardingQuestionCreateOrConnectWithoutAnswersInput = {
    where: OnboardingQuestionWhereUniqueInput
    create: XOR<OnboardingQuestionCreateWithoutAnswersInput, OnboardingQuestionUncheckedCreateWithoutAnswersInput>
  }

  export type OnboardingOptionCreateWithoutAnswersInput = {
    id?: string
    value: string
    label: string
    iconSlug?: string | null
    sortOrder?: number | null
    question: OnboardingQuestionCreateNestedOneWithoutOptionsInput
  }

  export type OnboardingOptionUncheckedCreateWithoutAnswersInput = {
    id?: string
    questionId: string
    value: string
    label: string
    iconSlug?: string | null
    sortOrder?: number | null
  }

  export type OnboardingOptionCreateOrConnectWithoutAnswersInput = {
    where: OnboardingOptionWhereUniqueInput
    create: XOR<OnboardingOptionCreateWithoutAnswersInput, OnboardingOptionUncheckedCreateWithoutAnswersInput>
  }

  export type OnboardingResponseUpsertWithoutAnswersInput = {
    update: XOR<OnboardingResponseUpdateWithoutAnswersInput, OnboardingResponseUncheckedUpdateWithoutAnswersInput>
    create: XOR<OnboardingResponseCreateWithoutAnswersInput, OnboardingResponseUncheckedCreateWithoutAnswersInput>
    where?: OnboardingResponseWhereInput
  }

  export type OnboardingResponseUpdateToOneWithWhereWithoutAnswersInput = {
    where?: OnboardingResponseWhereInput
    data: XOR<OnboardingResponseUpdateWithoutAnswersInput, OnboardingResponseUncheckedUpdateWithoutAnswersInput>
  }

  export type OnboardingResponseUpdateWithoutAnswersInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    clientFingerprint?: StringFieldUpdateOperationsInput | string
    intentTag?: EnumIntentTagFieldUpdateOperationsInput | $Enums.IntentTag
    orgSizeBracket?: EnumOrgSizeBracketFieldUpdateOperationsInput | $Enums.OrgSizeBracket
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tagVersion?: OnboardingTagVersionUpdateOneRequiredWithoutResponsesNestedInput
  }

  export type OnboardingResponseUncheckedUpdateWithoutAnswersInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    clientFingerprint?: StringFieldUpdateOperationsInput | string
    intentTag?: EnumIntentTagFieldUpdateOperationsInput | $Enums.IntentTag
    orgSizeBracket?: EnumOrgSizeBracketFieldUpdateOperationsInput | $Enums.OrgSizeBracket
    tagVersionId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OnboardingQuestionUpsertWithoutAnswersInput = {
    update: XOR<OnboardingQuestionUpdateWithoutAnswersInput, OnboardingQuestionUncheckedUpdateWithoutAnswersInput>
    create: XOR<OnboardingQuestionCreateWithoutAnswersInput, OnboardingQuestionUncheckedCreateWithoutAnswersInput>
    where?: OnboardingQuestionWhereInput
  }

  export type OnboardingQuestionUpdateToOneWithWhereWithoutAnswersInput = {
    where?: OnboardingQuestionWhereInput
    data: XOR<OnboardingQuestionUpdateWithoutAnswersInput, OnboardingQuestionUncheckedUpdateWithoutAnswersInput>
  }

  export type OnboardingQuestionUpdateWithoutAnswersInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    type?: EnumQuestionTypeFieldUpdateOperationsInput | $Enums.QuestionType
    title?: StringFieldUpdateOperationsInput | string
    iconSlug?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    allowOtherOption?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    version?: OnboardingTagVersionUpdateOneRequiredWithoutQuestionsNestedInput
    options?: OnboardingOptionUpdateManyWithoutQuestionNestedInput
  }

  export type OnboardingQuestionUncheckedUpdateWithoutAnswersInput = {
    id?: StringFieldUpdateOperationsInput | string
    versionId?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    type?: EnumQuestionTypeFieldUpdateOperationsInput | $Enums.QuestionType
    title?: StringFieldUpdateOperationsInput | string
    iconSlug?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    allowOtherOption?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    options?: OnboardingOptionUncheckedUpdateManyWithoutQuestionNestedInput
  }

  export type OnboardingOptionUpsertWithoutAnswersInput = {
    update: XOR<OnboardingOptionUpdateWithoutAnswersInput, OnboardingOptionUncheckedUpdateWithoutAnswersInput>
    create: XOR<OnboardingOptionCreateWithoutAnswersInput, OnboardingOptionUncheckedCreateWithoutAnswersInput>
    where?: OnboardingOptionWhereInput
  }

  export type OnboardingOptionUpdateToOneWithWhereWithoutAnswersInput = {
    where?: OnboardingOptionWhereInput
    data: XOR<OnboardingOptionUpdateWithoutAnswersInput, OnboardingOptionUncheckedUpdateWithoutAnswersInput>
  }

  export type OnboardingOptionUpdateWithoutAnswersInput = {
    id?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    iconSlug?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: NullableIntFieldUpdateOperationsInput | number | null
    question?: OnboardingQuestionUpdateOneRequiredWithoutOptionsNestedInput
  }

  export type OnboardingOptionUncheckedUpdateWithoutAnswersInput = {
    id?: StringFieldUpdateOperationsInput | string
    questionId?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    iconSlug?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type BlogPostCreateManyAuthorInput = {
    id?: string
    type?: $Enums.BlogPostType
    title: string
    slug: string
    status: $Enums.BlogPostStatus
    content: JsonNullValueInput | InputJsonValue
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BlogPostUpdateWithoutAuthorInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumBlogPostTypeFieldUpdateOperationsInput | $Enums.BlogPostType
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    status?: EnumBlogPostStatusFieldUpdateOperationsInput | $Enums.BlogPostStatus
    content?: JsonNullValueInput | InputJsonValue
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tags?: BlogTagUpdateManyWithoutPostsNestedInput
    seo?: BlogSeoUpdateOneWithoutBlogPostNestedInput
  }

  export type BlogPostUncheckedUpdateWithoutAuthorInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumBlogPostTypeFieldUpdateOperationsInput | $Enums.BlogPostType
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    status?: EnumBlogPostStatusFieldUpdateOperationsInput | $Enums.BlogPostStatus
    content?: JsonNullValueInput | InputJsonValue
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tags?: BlogTagUncheckedUpdateManyWithoutPostsNestedInput
    seo?: BlogSeoUncheckedUpdateOneWithoutBlogPostNestedInput
  }

  export type BlogPostUncheckedUpdateManyWithoutAuthorInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumBlogPostTypeFieldUpdateOperationsInput | $Enums.BlogPostType
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    status?: EnumBlogPostStatusFieldUpdateOperationsInput | $Enums.BlogPostStatus
    content?: JsonNullValueInput | InputJsonValue
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BlogTagUpdateWithoutPostsInput = {
    id?: StringFieldUpdateOperationsInput | string
    tag?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BlogTagUncheckedUpdateWithoutPostsInput = {
    id?: StringFieldUpdateOperationsInput | string
    tag?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BlogTagUncheckedUpdateManyWithoutPostsInput = {
    id?: StringFieldUpdateOperationsInput | string
    tag?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BlogPostUpdateWithoutTagsInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumBlogPostTypeFieldUpdateOperationsInput | $Enums.BlogPostType
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    status?: EnumBlogPostStatusFieldUpdateOperationsInput | $Enums.BlogPostStatus
    content?: JsonNullValueInput | InputJsonValue
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    author?: AdminAccountUpdateOneRequiredWithoutBlogPostNestedInput
    seo?: BlogSeoUpdateOneWithoutBlogPostNestedInput
  }

  export type BlogPostUncheckedUpdateWithoutTagsInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumBlogPostTypeFieldUpdateOperationsInput | $Enums.BlogPostType
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    authorId?: StringFieldUpdateOperationsInput | string
    status?: EnumBlogPostStatusFieldUpdateOperationsInput | $Enums.BlogPostStatus
    content?: JsonNullValueInput | InputJsonValue
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    seo?: BlogSeoUncheckedUpdateOneWithoutBlogPostNestedInput
  }

  export type BlogPostUncheckedUpdateManyWithoutTagsInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumBlogPostTypeFieldUpdateOperationsInput | $Enums.BlogPostType
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    authorId?: StringFieldUpdateOperationsInput | string
    status?: EnumBlogPostStatusFieldUpdateOperationsInput | $Enums.BlogPostStatus
    content?: JsonNullValueInput | InputJsonValue
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OnboardingQuestionCreateManyVersionInput = {
    id?: string
    slug: string
    type: $Enums.QuestionType
    title: string
    iconSlug?: string | null
    isActive?: boolean
    sortOrder?: number
    allowOtherOption?: boolean
    createdAt?: Date | string
  }

  export type OnboardingResponseCreateManyTagVersionInput = {
    id?: string
    userId: string
    email: string
    clientFingerprint: string
    intentTag: $Enums.IntentTag
    orgSizeBracket: $Enums.OrgSizeBracket
    createdAt?: Date | string
  }

  export type OnboardingQuestionUpdateWithoutVersionInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    type?: EnumQuestionTypeFieldUpdateOperationsInput | $Enums.QuestionType
    title?: StringFieldUpdateOperationsInput | string
    iconSlug?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    allowOtherOption?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    options?: OnboardingOptionUpdateManyWithoutQuestionNestedInput
    answers?: OnboardingAnswerUpdateManyWithoutQuestionNestedInput
  }

  export type OnboardingQuestionUncheckedUpdateWithoutVersionInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    type?: EnumQuestionTypeFieldUpdateOperationsInput | $Enums.QuestionType
    title?: StringFieldUpdateOperationsInput | string
    iconSlug?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    allowOtherOption?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    options?: OnboardingOptionUncheckedUpdateManyWithoutQuestionNestedInput
    answers?: OnboardingAnswerUncheckedUpdateManyWithoutQuestionNestedInput
  }

  export type OnboardingQuestionUncheckedUpdateManyWithoutVersionInput = {
    id?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    type?: EnumQuestionTypeFieldUpdateOperationsInput | $Enums.QuestionType
    title?: StringFieldUpdateOperationsInput | string
    iconSlug?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    allowOtherOption?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OnboardingResponseUpdateWithoutTagVersionInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    clientFingerprint?: StringFieldUpdateOperationsInput | string
    intentTag?: EnumIntentTagFieldUpdateOperationsInput | $Enums.IntentTag
    orgSizeBracket?: EnumOrgSizeBracketFieldUpdateOperationsInput | $Enums.OrgSizeBracket
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    answers?: OnboardingAnswerUpdateManyWithoutResponseNestedInput
  }

  export type OnboardingResponseUncheckedUpdateWithoutTagVersionInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    clientFingerprint?: StringFieldUpdateOperationsInput | string
    intentTag?: EnumIntentTagFieldUpdateOperationsInput | $Enums.IntentTag
    orgSizeBracket?: EnumOrgSizeBracketFieldUpdateOperationsInput | $Enums.OrgSizeBracket
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    answers?: OnboardingAnswerUncheckedUpdateManyWithoutResponseNestedInput
  }

  export type OnboardingResponseUncheckedUpdateManyWithoutTagVersionInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    clientFingerprint?: StringFieldUpdateOperationsInput | string
    intentTag?: EnumIntentTagFieldUpdateOperationsInput | $Enums.IntentTag
    orgSizeBracket?: EnumOrgSizeBracketFieldUpdateOperationsInput | $Enums.OrgSizeBracket
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OnboardingOptionCreateManyQuestionInput = {
    id?: string
    value: string
    label: string
    iconSlug?: string | null
    sortOrder?: number | null
  }

  export type OnboardingAnswerCreateManyQuestionInput = {
    id?: string
    responseId: string
    optionId?: string | null
    customValue?: string | null
  }

  export type OnboardingOptionUpdateWithoutQuestionInput = {
    id?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    iconSlug?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: NullableIntFieldUpdateOperationsInput | number | null
    answers?: OnboardingAnswerUpdateManyWithoutOptionNestedInput
  }

  export type OnboardingOptionUncheckedUpdateWithoutQuestionInput = {
    id?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    iconSlug?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: NullableIntFieldUpdateOperationsInput | number | null
    answers?: OnboardingAnswerUncheckedUpdateManyWithoutOptionNestedInput
  }

  export type OnboardingOptionUncheckedUpdateManyWithoutQuestionInput = {
    id?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    label?: StringFieldUpdateOperationsInput | string
    iconSlug?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type OnboardingAnswerUpdateWithoutQuestionInput = {
    id?: StringFieldUpdateOperationsInput | string
    customValue?: NullableStringFieldUpdateOperationsInput | string | null
    response?: OnboardingResponseUpdateOneRequiredWithoutAnswersNestedInput
    option?: OnboardingOptionUpdateOneWithoutAnswersNestedInput
  }

  export type OnboardingAnswerUncheckedUpdateWithoutQuestionInput = {
    id?: StringFieldUpdateOperationsInput | string
    responseId?: StringFieldUpdateOperationsInput | string
    optionId?: NullableStringFieldUpdateOperationsInput | string | null
    customValue?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type OnboardingAnswerUncheckedUpdateManyWithoutQuestionInput = {
    id?: StringFieldUpdateOperationsInput | string
    responseId?: StringFieldUpdateOperationsInput | string
    optionId?: NullableStringFieldUpdateOperationsInput | string | null
    customValue?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type OnboardingAnswerCreateManyOptionInput = {
    id?: string
    responseId: string
    questionId: string
    customValue?: string | null
  }

  export type OnboardingAnswerUpdateWithoutOptionInput = {
    id?: StringFieldUpdateOperationsInput | string
    customValue?: NullableStringFieldUpdateOperationsInput | string | null
    response?: OnboardingResponseUpdateOneRequiredWithoutAnswersNestedInput
    question?: OnboardingQuestionUpdateOneRequiredWithoutAnswersNestedInput
  }

  export type OnboardingAnswerUncheckedUpdateWithoutOptionInput = {
    id?: StringFieldUpdateOperationsInput | string
    responseId?: StringFieldUpdateOperationsInput | string
    questionId?: StringFieldUpdateOperationsInput | string
    customValue?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type OnboardingAnswerUncheckedUpdateManyWithoutOptionInput = {
    id?: StringFieldUpdateOperationsInput | string
    responseId?: StringFieldUpdateOperationsInput | string
    questionId?: StringFieldUpdateOperationsInput | string
    customValue?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type OnboardingAnswerCreateManyResponseInput = {
    id?: string
    questionId: string
    optionId?: string | null
    customValue?: string | null
  }

  export type OnboardingAnswerUpdateWithoutResponseInput = {
    id?: StringFieldUpdateOperationsInput | string
    customValue?: NullableStringFieldUpdateOperationsInput | string | null
    question?: OnboardingQuestionUpdateOneRequiredWithoutAnswersNestedInput
    option?: OnboardingOptionUpdateOneWithoutAnswersNestedInput
  }

  export type OnboardingAnswerUncheckedUpdateWithoutResponseInput = {
    id?: StringFieldUpdateOperationsInput | string
    questionId?: StringFieldUpdateOperationsInput | string
    optionId?: NullableStringFieldUpdateOperationsInput | string | null
    customValue?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type OnboardingAnswerUncheckedUpdateManyWithoutResponseInput = {
    id?: StringFieldUpdateOperationsInput | string
    questionId?: StringFieldUpdateOperationsInput | string
    optionId?: NullableStringFieldUpdateOperationsInput | string | null
    customValue?: NullableStringFieldUpdateOperationsInput | string | null
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}