using System.Linq.Expressions;

namespace ilet.server.Interfaces
{
    public interface IRepositoryDb<T> where T : class
    {
        Task<IEnumerable<T>> GetAllAsync();
        IQueryable<T> Query();
        Task<T?> GetByIdAsync(int id);
        Task AddAsync(T entity);
        void Update(T entity);
        void Delete(T entity); // zaten var
        Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate);
        Task<List<T>> WhereAsync(Expression<Func<T, bool>> predicate);
        Task SaveAsync();
        Task<bool> AnyAsync(Expression<Func<T, bool>> predicate);
        // 🔧 Yeni eklenenler:
        Task DeleteAsync(T entity);
        Task DeleteRangeAsync(IEnumerable<T> entities);
    }
}
