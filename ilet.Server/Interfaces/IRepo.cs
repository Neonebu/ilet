namespace ilet.Server.Interfaces
{
    public interface IRepo<T> where T : class
    {
        Task<IEnumerable<T>> GetAllAsync();
        Task<T?> GetByIdAsync(string id);
        Task AddAsync(T entity);
        void Update(T entity);
        void Delete(T entity);
        Task SaveAsync();
    }
}
